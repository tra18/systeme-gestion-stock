from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from database import get_db
from models import StockItem, StockMovement, PurchaseCategory
from schemas import (
    StockItemCreate, StockItemUpdate, StockItem as StockItemSchema,
    StockMovementCreate, StockMovement as StockMovementSchema,
    StockAlert
)
import os

router = APIRouter(prefix="/stock", tags=["stock"])

@router.post("/items", response_model=StockItemSchema)
async def create_stock_item(item: StockItemCreate, db: Session = Depends(get_db)):
    """Créer un nouvel article en stock"""
    db_item = StockItem(**item.dict())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/items", response_model=List[StockItemSchema])
async def get_stock_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    category: Optional[PurchaseCategory] = None,
    low_stock: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Récupérer les articles en stock avec filtres"""
    query = db.query(StockItem).filter(StockItem.is_active == True)
    
    if category:
        query = query.filter(StockItem.category == category)
    if low_stock is not None:
        if low_stock:
            query = query.filter(StockItem.current_quantity <= StockItem.min_threshold)
        else:
            query = query.filter(StockItem.current_quantity > StockItem.min_threshold)
    
    return query.offset(skip).limit(limit).all()

@router.get("/items/{item_id}", response_model=StockItemSchema)
async def get_stock_item(item_id: int, db: Session = Depends(get_db)):
    """Récupérer un article par ID"""
    item = db.query(StockItem).filter(StockItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    return item

@router.put("/items/{item_id}", response_model=StockItemSchema)
async def update_stock_item(
    item_id: int,
    item_update: StockItemUpdate,
    db: Session = Depends(get_db)
):
    """Mettre à jour un article en stock"""
    item = db.query(StockItem).filter(StockItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    
    update_data = item_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    
    item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(item)
    return item

@router.delete("/items/{item_id}")
async def delete_stock_item(item_id: int, db: Session = Depends(get_db)):
    """Supprimer un article (désactivation)"""
    item = db.query(StockItem).filter(StockItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    
    item.is_active = False
    item.updated_at = datetime.utcnow()
    db.commit()
    return {"message": "Article désactivé avec succès"}

@router.post("/movements", response_model=StockMovementSchema)
async def create_stock_movement(movement: StockMovementCreate, db: Session = Depends(get_db)):
    """Créer un mouvement de stock"""
    # Vérifier que l'article existe
    stock_item = db.query(StockItem).filter(StockItem.id == movement.stock_item_id).first()
    if not stock_item:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    
    # Créer le mouvement
    db_movement = StockMovement(**movement.dict())
    db.add(db_movement)
    
    # Mettre à jour la quantité en stock
    if movement.movement_type == "in":
        stock_item.current_quantity += movement.quantity
    elif movement.movement_type == "out":
        if stock_item.current_quantity < movement.quantity:
            raise HTTPException(
                status_code=400, 
                detail=f"Stock insuffisant. Disponible: {stock_item.current_quantity}, Demandé: {movement.quantity}"
            )
        stock_item.current_quantity -= movement.quantity
    elif movement.movement_type == "adjustment":
        stock_item.current_quantity = movement.quantity
    
    stock_item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_movement)
    return db_movement

@router.get("/movements", response_model=List[StockMovementSchema])
async def get_stock_movements(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    item_id: Optional[int] = None,
    movement_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Récupérer les mouvements de stock"""
    query = db.query(StockMovement)
    
    if item_id:
        query = query.filter(StockMovement.stock_item_id == item_id)
    if movement_type:
        query = query.filter(StockMovement.movement_type == movement_type)
    
    return query.order_by(StockMovement.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/alerts", response_model=List[StockAlert])
async def get_stock_alerts(db: Session = Depends(get_db)):
    """Récupérer les alertes de stock (articles en rupture ou seuil bas)"""
    items = db.query(StockItem).filter(StockItem.is_active == True).all()
    
    alerts = []
    for item in items:
        if item.current_quantity == 0:
            alerts.append(StockAlert(
                item_id=item.id,
                item_name=item.name,
                current_quantity=item.current_quantity,
                min_threshold=item.min_threshold,
                status="out_of_stock"
            ))
        elif item.current_quantity <= item.min_threshold:
            alerts.append(StockAlert(
                item_id=item.id,
                item_name=item.name,
                current_quantity=item.current_quantity,
                min_threshold=item.min_threshold,
                status="low"
            ))
        elif item.current_quantity <= item.min_threshold * 1.5:  # Seuil critique
            alerts.append(StockAlert(
                item_id=item.id,
                item_name=item.name,
                current_quantity=item.current_quantity,
                min_threshold=item.min_threshold,
                status="critical"
            ))
    
    return alerts

@router.get("/reorder-list")
async def get_reorder_list(db: Session = Depends(get_db)):
    """Liste des articles à réapprovisionner"""
    items = db.query(StockItem).filter(
        StockItem.is_active == True,
        StockItem.current_quantity <= StockItem.min_threshold
    ).all()
    
    reorder_list = []
    for item in items:
        suggested_quantity = item.max_threshold - item.current_quantity
        reorder_list.append({
            "item_id": item.id,
            "name": item.name,
            "current_quantity": item.current_quantity,
            "min_threshold": item.min_threshold,
            "max_threshold": item.max_threshold,
            "suggested_quantity": suggested_quantity,
            "unit_cost": item.unit_cost,
            "estimated_cost": suggested_quantity * item.unit_cost,
            "location": item.location
        })
    
    return {
        "total_items": len(reorder_list),
        "total_estimated_cost": sum(item["estimated_cost"] for item in reorder_list),
        "items": reorder_list
    }

@router.get("/stats/summary")
async def get_stock_summary(db: Session = Depends(get_db)):
    """Résumé du stock"""
    items = db.query(StockItem).filter(StockItem.is_active == True).all()
    
    if not items:
        return {
            "total_items": 0,
            "total_value": 0.0,
            "low_stock_count": 0,
            "out_of_stock_count": 0,
            "categories": {}
        }
    
    total_value = sum(item.current_quantity * item.unit_cost for item in items)
    low_stock_count = len([item for item in items if item.current_quantity <= item.min_threshold])
    out_of_stock_count = len([item for item in items if item.current_quantity == 0])
    
    # Statistiques par catégorie
    categories = {}
    for item in items:
        cat = item.category
        if cat not in categories:
            categories[cat] = {
                "count": 0,
                "total_quantity": 0,
                "total_value": 0.0,
                "low_stock": 0
            }
        categories[cat]["count"] += 1
        categories[cat]["total_quantity"] += item.current_quantity
        categories[cat]["total_value"] += item.current_quantity * item.unit_cost
        if item.current_quantity <= item.min_threshold:
            categories[cat]["low_stock"] += 1
    
    return {
        "total_items": len(items),
        "total_value": total_value,
        "low_stock_count": low_stock_count,
        "out_of_stock_count": out_of_stock_count,
        "categories": categories
    }

@router.post("/items/{item_id}/adjust")
async def adjust_stock_quantity(
    item_id: int,
    new_quantity: int,
    reason: str = "Ajustement manuel",
    db: Session = Depends(get_db)
):
    """Ajuster manuellement la quantité en stock"""
    item = db.query(StockItem).filter(StockItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Article non trouvé")
    
    old_quantity = item.current_quantity
    item.current_quantity = new_quantity
    item.updated_at = datetime.utcnow()
    
    # Créer un mouvement d'ajustement
    movement = StockMovement(
        stock_item_id=item_id,
        movement_type="adjustment",
        quantity=new_quantity,
        reason=f"Ajustement: {reason} (ancien: {old_quantity}, nouveau: {new_quantity})"
    )
    db.add(movement)
    
    db.commit()
    return {
        "message": f"Stock ajusté de {old_quantity} à {new_quantity}",
        "new_quantity": new_quantity
    }
