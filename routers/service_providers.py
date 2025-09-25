from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import ServiceProvider
from schemas import ServiceProviderCreate, ServiceProviderUpdate, ServiceProvider as ServiceProviderSchema
from auth import get_current_active_user

router = APIRouter(prefix="/service-providers", tags=["service-providers"])

@router.post("/", response_model=ServiceProviderSchema)
async def create_service_provider(
    provider: ServiceProviderCreate, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Créer un nouveau prestataire de service"""
    db_provider = ServiceProvider(**provider.dict())
    db.add(db_provider)
    db.commit()
    db.refresh(db_provider)
    return db_provider

@router.get("/", response_model=List[ServiceProviderSchema])
async def get_service_providers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    service_type: Optional[str] = None,
    city: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Récupérer les prestataires de service avec filtres"""
    query = db.query(ServiceProvider)
    
    if service_type:
        query = query.filter(ServiceProvider.service_type.ilike(f"%{service_type}%"))
    
    if city:
        query = query.filter(ServiceProvider.city.ilike(f"%{city}%"))
    
    if is_active is not None:
        query = query.filter(ServiceProvider.is_active == is_active)
    
    return query.order_by(ServiceProvider.name).offset(skip).limit(limit).all()

@router.get("/{provider_id}", response_model=ServiceProviderSchema)
async def get_service_provider(
    provider_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Récupérer un prestataire de service par ID"""
    provider = db.query(ServiceProvider).filter(ServiceProvider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Prestataire non trouvé")
    return provider

@router.put("/{provider_id}", response_model=ServiceProviderSchema)
async def update_service_provider(
    provider_id: int,
    provider_update: ServiceProviderUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Mettre à jour un prestataire de service"""
    provider = db.query(ServiceProvider).filter(ServiceProvider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Prestataire non trouvé")
    
    update_data = provider_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(provider, field, value)
    
    db.commit()
    db.refresh(provider)
    return provider

@router.delete("/{provider_id}")
async def delete_service_provider(
    provider_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Supprimer un prestataire de service"""
    provider = db.query(ServiceProvider).filter(ServiceProvider.id == provider_id).first()
    if not provider:
        raise HTTPException(status_code=404, detail="Prestataire non trouvé")
    
    db.delete(provider)
    db.commit()
    return {"message": "Prestataire supprimé avec succès"}

@router.get("/stats/summary")
async def get_service_providers_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Récupérer les statistiques des prestataires"""
    total_providers = db.query(ServiceProvider).count()
    active_providers = db.query(ServiceProvider).filter(ServiceProvider.is_active == True).count()
    
    # Statistiques par type de service
    service_types = db.query(ServiceProvider.service_type, db.func.count(ServiceProvider.id)).group_by(ServiceProvider.service_type).all()
    
    return {
        "total_providers": total_providers,
        "active_providers": active_providers,
        "inactive_providers": total_providers - active_providers,
        "service_types": [{"type": st[0], "count": st[1]} for st in service_types]
    }
