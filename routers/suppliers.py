from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from database import get_db
from models import Supplier
from schemas import SupplierCreate, SupplierUpdate, Supplier as SupplierSchema
from auth import get_current_active_user, require_role, UserRole

router = APIRouter(prefix="/suppliers", tags=["suppliers"])

@router.post("/", response_model=SupplierSchema)
async def create_supplier(
    supplier: SupplierCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(require_role(UserRole.MANAGER))
):
    """Créer un nouveau fournisseur"""
    # Vérifier si le fournisseur existe déjà
    existing_supplier = db.query(Supplier).filter(
        Supplier.name == supplier.name
    ).first()
    
    if existing_supplier:
        raise HTTPException(
            status_code=400, 
            detail="Un fournisseur avec ce nom existe déjà"
        )
    
    db_supplier = Supplier(**supplier.dict())
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier

@router.get("/", response_model=List[SupplierSchema])
async def get_suppliers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    active_only: bool = Query(True, description="Afficher seulement les fournisseurs actifs"),
    search: Optional[str] = Query(None, description="Rechercher par nom ou contact"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Récupérer la liste des fournisseurs"""
    query = db.query(Supplier)
    
    if active_only:
        query = query.filter(Supplier.is_active == True)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Supplier.name.ilike(search_term)) |
            (Supplier.contact_person.ilike(search_term)) |
            (Supplier.email.ilike(search_term))
        )
    
    return query.offset(skip).limit(limit).all()

@router.get("/{supplier_id}", response_model=SupplierSchema)
async def get_supplier(
    supplier_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Récupérer un fournisseur par ID"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Fournisseur non trouvé")
    return supplier

@router.put("/{supplier_id}", response_model=SupplierSchema)
async def update_supplier(
    supplier_id: int,
    supplier_update: SupplierUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(UserRole.MANAGER))
):
    """Mettre à jour un fournisseur"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Fournisseur non trouvé")
    
    update_data = supplier_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(supplier, field, value)
    
    supplier.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(supplier)
    return supplier

@router.delete("/{supplier_id}")
async def delete_supplier(
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_role(UserRole.MANAGER))
):
    """Supprimer un fournisseur (désactivation)"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Fournisseur non trouvé")
    
    # Vérifier s'il y a des achats liés à ce fournisseur
    from models import Purchase
    purchases_count = db.query(Purchase).filter(Purchase.supplier == supplier.name).count()
    
    if purchases_count > 0:
        # Désactiver au lieu de supprimer
        supplier.is_active = False
        supplier.updated_at = datetime.utcnow()
        db.commit()
        return {"message": "Fournisseur désactivé (des achats sont liés à ce fournisseur)"}
    else:
        # Supprimer complètement
        db.delete(supplier)
        db.commit()
        return {"message": "Fournisseur supprimé avec succès"}

@router.get("/{supplier_id}/purchases")
async def get_supplier_purchases(
    supplier_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Récupérer les achats d'un fournisseur"""
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Fournisseur non trouvé")
    
    from models import Purchase
    purchases = db.query(Purchase).filter(
        Purchase.supplier == supplier.name
    ).order_by(Purchase.purchase_date.desc()).offset(skip).limit(limit).all()
    
    return {
        "supplier": supplier,
        "purchases": purchases,
        "total_purchases": len(purchases),
        "total_amount": sum(p.amount for p in purchases)
    }

@router.get("/stats/summary")
async def get_suppliers_summary(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Résumé des fournisseurs"""
    from models import Purchase
    
    total_suppliers = db.query(Supplier).count()
    active_suppliers = db.query(Supplier).filter(Supplier.is_active == True).count()
    
    # Top 5 des fournisseurs par montant d'achats
    supplier_stats = db.query(
        Purchase.supplier,
        db.func.count(Purchase.id).label('purchase_count'),
        db.func.sum(Purchase.amount).label('total_amount')
    ).filter(Purchase.supplier.isnot(None)).group_by(
        Purchase.supplier
    ).order_by(db.func.sum(Purchase.amount).desc()).limit(5).all()
    
    return {
        "total_suppliers": total_suppliers,
        "active_suppliers": active_suppliers,
        "inactive_suppliers": total_suppliers - active_suppliers,
        "top_suppliers": [
            {
                "name": stat.supplier,
                "purchase_count": stat.purchase_count,
                "total_amount": float(stat.total_amount or 0)
            }
            for stat in supplier_stats
        ]
    }
