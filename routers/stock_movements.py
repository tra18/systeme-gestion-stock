from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from database import get_db
from models import StockMovement, StockItem, User
from schemas import StockMovementCreate, StockMovementUpdate, StockMovement as StockMovementSchema
from auth import get_current_active_user

router = APIRouter(prefix="/stock-movements", tags=["stock-movements"])

@router.post("/", response_model=StockMovementSchema)
async def create_stock_movement(
    movement: StockMovementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Créer un nouveau mouvement de stock"""
    # Vérifier que l'article de stock existe
    stock_item = db.query(StockItem).filter(StockItem.id == movement.stock_item_id).first()
    if not stock_item:
        raise HTTPException(status_code=404, detail="Article de stock non trouvé")
    
    # Créer le mouvement
    movement_data = movement.dict()
    movement_data['user_id'] = current_user.id
    
    db_movement = StockMovement(**movement_data)
    db.add(db_movement)
    
    # Mettre à jour la quantité en stock
    if movement.movement_type == "entry":
        stock_item.current_quantity += movement.quantity
    elif movement.movement_type == "exit":
        if stock_item.current_quantity < movement.quantity:
            raise HTTPException(
                status_code=400, 
                detail=f"Quantité insuffisante en stock. Disponible: {stock_item.current_quantity}, Demandée: {movement.quantity}"
            )
        stock_item.current_quantity -= movement.quantity
    
    stock_item.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_movement)
    
    return db_movement

@router.get("/", response_model=List[StockMovementSchema])
async def get_stock_movements(
    stock_item_id: int = None,
    movement_type: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Récupérer les mouvements de stock"""
    query = db.query(StockMovement)
    
    if stock_item_id:
        query = query.filter(StockMovement.stock_item_id == stock_item_id)
    
    if movement_type:
        query = query.filter(StockMovement.movement_type == movement_type)
    
    movements = query.order_by(StockMovement.created_at.desc()).all()
    return movements

@router.get("/{movement_id}", response_model=StockMovementSchema)
async def get_stock_movement(
    movement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Récupérer un mouvement de stock spécifique"""
    movement = db.query(StockMovement).filter(StockMovement.id == movement_id).first()
    if not movement:
        raise HTTPException(status_code=404, detail="Mouvement de stock non trouvé")
    return movement

@router.put("/{movement_id}", response_model=StockMovementSchema)
async def update_stock_movement(
    movement_id: int,
    movement_update: StockMovementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Mettre à jour un mouvement de stock"""
    movement = db.query(StockMovement).filter(StockMovement.id == movement_id).first()
    if not movement:
        raise HTTPException(status_code=404, detail="Mouvement de stock non trouvé")
    
    # Mettre à jour les champs
    for field, value in movement_update.dict(exclude_unset=True).items():
        setattr(movement, field, value)
    
    db.commit()
    db.refresh(movement)
    return movement

@router.delete("/{movement_id}")
async def delete_stock_movement(
    movement_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Supprimer un mouvement de stock"""
    movement = db.query(StockMovement).filter(StockMovement.id == movement_id).first()
    if not movement:
        raise HTTPException(status_code=404, detail="Mouvement de stock non trouvé")
    
    # Annuler l'effet du mouvement sur le stock
    stock_item = db.query(StockItem).filter(StockItem.id == movement.stock_item_id).first()
    if stock_item:
        if movement.movement_type == "entry":
            stock_item.current_quantity -= movement.quantity
        elif movement.movement_type == "exit":
            stock_item.current_quantity += movement.quantity
        stock_item.updated_at = datetime.utcnow()
    
    db.delete(movement)
    db.commit()
    
    return {"message": "Mouvement de stock supprimé avec succès"}
