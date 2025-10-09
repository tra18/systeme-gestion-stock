from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from database import get_db
from models import Purchase, PurchaseCategory, PurchasePeriod, StockItem, StockMovement, User
from schemas import PurchaseCreate, PurchaseUpdate, Purchase as PurchaseSchema, PurchaseReport
from auth import get_current_active_user
import calendar

router = APIRouter(prefix="/purchases", tags=["purchases"])

@router.post("/", response_model=PurchaseSchema)
async def create_purchase(
    purchase: PurchaseCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Créer un nouvel achat et l'article de stock correspondant"""
    # Calculer le total automatiquement
    purchase_data = purchase.dict()
    purchase_data['total'] = purchase.quantity * purchase.unit_price
    
    # Créer l'achat
    db_purchase = Purchase(**purchase_data)
    db.add(db_purchase)
    db.commit()
    db.refresh(db_purchase)
    
    # Vérifier si l'article existe déjà dans le stock
    existing_item = db.query(StockItem).filter(
        StockItem.name == purchase.item_name,
        StockItem.category == purchase.category
    ).first()
    
    if existing_item:
        # Mettre à jour la quantité existante
        existing_item.current_quantity += purchase.quantity
        existing_item.updated_at = datetime.utcnow()
        db.commit()
        
        # Créer un mouvement d'entrée
        movement = StockMovement(
            stock_item_id=existing_item.id,
            movement_type="entry",
            quantity=purchase.quantity,
            reason=f"Achat - {purchase.item_name}",
            reference=f"ACH-{db_purchase.id}"
        )
        db.add(movement)
        db.commit()
    else:
        # Créer un nouvel article de stock
        stock_item = StockItem(
            name=purchase.item_name,
            description=purchase.description or f"Achat du {purchase.purchase_date.strftime('%d/%m/%Y')}",
            category=purchase.category,
            current_quantity=purchase.quantity,
            min_threshold=5,  # Seuil par défaut
            max_threshold=100,  # Seuil par défaut
            unit="pièce",  # Unité par défaut
            location="Stock général"
        )
        db.add(stock_item)
        db.commit()
        db.refresh(stock_item)
        
        # Créer un mouvement d'entrée
        movement = StockMovement(
            stock_item_id=stock_item.id,
            movement_type="entry",
            quantity=purchase.quantity,
            reason=f"Achat - {purchase.item_name}",
            reference=f"ACH-{db_purchase.id}"
        )
        db.add(movement)
        db.commit()
    
    return db_purchase

@router.get("/{purchase_id}/stock-item")
async def get_purchase_stock_item(
    purchase_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Récupérer l'article de stock lié à un achat"""
    purchase = db.query(Purchase).filter(Purchase.id == purchase_id).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Achat non trouvé")
    
    # Chercher l'article de stock correspondant
    stock_item = db.query(StockItem).filter(
        StockItem.name == purchase.item_name,
        StockItem.category == purchase.category
    ).first()
    
    if not stock_item:
        raise HTTPException(status_code=404, detail="Article de stock non trouvé")
    
    return stock_item

@router.get("/", response_model=List[PurchaseSchema])
async def get_purchases(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    category: Optional[PurchaseCategory] = None,
    period: Optional[PurchasePeriod] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Récupérer les achats avec filtres"""
    query = db.query(Purchase)
    
    if category:
        query = query.filter(Purchase.category == category)
    if period:
        query = query.filter(Purchase.period == period)
    if start_date:
        query = query.filter(Purchase.purchase_date >= start_date)
    if end_date:
        query = query.filter(Purchase.purchase_date <= end_date)
    
    return query.offset(skip).limit(limit).all()

@router.get("/{purchase_id}", response_model=PurchaseSchema)
async def get_purchase(
    purchase_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Récupérer un achat par ID"""
    purchase = db.query(Purchase).filter(Purchase.id == purchase_id).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Achat non trouvé")
    return purchase

@router.put("/{purchase_id}", response_model=PurchaseSchema)
async def update_purchase(
    purchase_id: int, 
    purchase_update: PurchaseUpdate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Mettre à jour un achat"""
    purchase = db.query(Purchase).filter(Purchase.id == purchase_id).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Achat non trouvé")
    
    update_data = purchase_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(purchase, field, value)
    
    purchase.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(purchase)
    return purchase

@router.delete("/{purchase_id}")
async def delete_purchase(
    purchase_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Supprimer un achat"""
    purchase = db.query(Purchase).filter(Purchase.id == purchase_id).first()
    if not purchase:
        raise HTTPException(status_code=404, detail="Achat non trouvé")
    
    db.delete(purchase)
    db.commit()
    return {"message": "Achat supprimé avec succès"}

@router.get("/reports/period/{period}", response_model=PurchaseReport)
async def get_purchase_report(
    period: PurchasePeriod,
    year: int = Query(..., description="Année"),
    month: Optional[int] = Query(None, description="Mois (pour les rapports mensuels)"),
    week: Optional[int] = Query(None, description="Semaine (pour les rapports hebdomadaires)"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Générer un rapport d'achats par période"""
    
    # Définir les dates selon la période
    if period == PurchasePeriod.DAILY:
        if not month:
            raise HTTPException(status_code=400, detail="Le mois est requis pour les rapports journaliers")
        start_date = datetime(year, month, 1)
        end_date = datetime(year, month, calendar.monthrange(year, month)[1])
    elif period == PurchasePeriod.WEEKLY:
        if not week:
            raise HTTPException(status_code=400, detail="La semaine est requise pour les rapports hebdomadaires")
        # Calculer le début de la semaine
        start_date = datetime(year, 1, 1) + timedelta(weeks=week-1)
        end_date = start_date + timedelta(days=6)
    elif period == PurchasePeriod.MONTHLY:
        if not month:
            raise HTTPException(status_code=400, detail="Le mois est requis pour les rapports mensuels")
        start_date = datetime(year, month, 1)
        end_date = datetime(year, month, calendar.monthrange(year, month)[1])
    elif period == PurchasePeriod.SEMESTRIAL:
        semester = 1 if month and month <= 6 else 2
        if semester == 1:
            start_date = datetime(year, 1, 1)
            end_date = datetime(year, 6, 30)
        else:
            start_date = datetime(year, 7, 1)
            end_date = datetime(year, 12, 31)
    elif period == PurchasePeriod.ANNUAL:
        start_date = datetime(year, 1, 1)
        end_date = datetime(year, 12, 31)
    
    # Récupérer les achats dans la période
    purchases = db.query(Purchase).filter(
        Purchase.purchase_date >= start_date,
        Purchase.purchase_date <= end_date
    ).all()
    
    # Calculer les statistiques
    total_amount = sum(p.amount for p in purchases)
    item_count = len(purchases)
    
    # Répartition par catégorie
    category_breakdown = {}
    for purchase in purchases:
        category = purchase.category
        if category not in category_breakdown:
            category_breakdown[category] = {"count": 0, "amount": 0.0}
        category_breakdown[category]["count"] += 1
        category_breakdown[category]["amount"] += purchase.amount
    
    return PurchaseReport(
        period=f"{period.value}_{year}",
        total_amount=total_amount,
        category_breakdown=category_breakdown,
        item_count=item_count
    )

@router.get("/reports/category/{category}")
async def get_purchases_by_category(
    category: PurchaseCategory,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Récupérer les achats par catégorie avec filtres de date"""
    query = db.query(Purchase).filter(Purchase.category == category)
    
    if start_date:
        query = query.filter(Purchase.purchase_date >= start_date)
    if end_date:
        query = query.filter(Purchase.purchase_date <= end_date)
    
    purchases = query.all()
    
    return {
        "category": category.value,
        "total_purchases": len(purchases),
        "total_amount": sum(p.amount for p in purchases),
        "purchases": purchases
    }

@router.get("/stats/summary")
async def get_purchase_summary(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Résumé des achats avec statistiques"""
    query = db.query(Purchase)
    
    if start_date:
        query = query.filter(Purchase.purchase_date >= start_date)
    if end_date:
        query = query.filter(Purchase.purchase_date <= end_date)
    
    purchases = query.all()
    
    if not purchases:
        return {
            "total_purchases": 0,
            "total_amount": 0.0,
            "average_amount": 0.0,
            "categories": {},
            "periods": {}
        }
    
    total_amount = sum(p.amount for p in purchases)
    average_amount = total_amount / len(purchases)
    
    # Statistiques par catégorie
    categories = {}
    for purchase in purchases:
        cat = purchase.category
        if cat not in categories:
            categories[cat] = {"count": 0, "amount": 0.0}
        categories[cat]["count"] += 1
        categories[cat]["amount"] += purchase.amount
    
    # Statistiques par période
    periods = {}
    for purchase in purchases:
        period = purchase.period
        if period not in periods:
            periods[period] = {"count": 0, "amount": 0.0}
        periods[period]["count"] += 1
        periods[period]["amount"] += purchase.amount
    
    return {
        "total_purchases": len(purchases),
        "total_amount": total_amount,
        "average_amount": average_amount,
        "categories": categories,
        "periods": periods
    }
