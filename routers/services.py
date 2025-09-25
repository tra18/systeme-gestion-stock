from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import string
import random

from database import get_db
from models import Service as ServiceModel, User, UserRole
from schemas import ServiceCreate, ServiceUpdate, Service
from auth import get_current_active_user

router = APIRouter(prefix="/services", tags=["services"])

def generate_service_code():
    """Génère un code de service unique"""
    # Format: SVC-XXXX (4 caractères alphanumériques)
    while True:
        code = "SVC-" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        # Vérifier l'unicité sera fait au niveau de la base de données
        return code

@router.post("/", response_model=Service, status_code=status.HTTP_201_CREATED)
async def create_service(
    service: ServiceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Créer un nouveau service (Admin seulement)"""
    if not current_user.can_manage_users and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas la permission de créer des services"
        )
    
    # Générer un code unique
    max_attempts = 10
    for _ in range(max_attempts):
        code = generate_service_code()
        existing_service = db.query(ServiceModel).filter(ServiceModel.code == code).first()
        if not existing_service:
            break
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Impossible de générer un code unique"
        )
    
    db_service = ServiceModel(
        code=code,
        name=service.name,
        description=service.description,
        department_head=service.department_head,
        email=service.email,
        phone=service.phone,
        location=service.location
    )
    
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    
    return db_service

@router.get("/", response_model=List[Service])
async def get_services(
    search: Optional[str] = Query(None, description="Rechercher par nom ou code"),
    is_active: Optional[bool] = Query(None, description="Filtrer par statut actif"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Récupérer la liste des services"""
    query = db.query(ServiceModel)
    
    if search:
        query = query.filter(
            ServiceModel.name.contains(search) | 
            ServiceModel.code.contains(search)
        )
    
    if is_active is not None:
        query = query.filter(ServiceModel.is_active == is_active)
    
    return query.order_by(ServiceModel.name).all()

@router.get("/{service_id}", response_model=Service)
async def get_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Récupérer un service spécifique"""
    service = db.query(ServiceModel).filter(ServiceModel.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    
    return service

@router.put("/{service_id}", response_model=Service)
async def update_service(
    service_id: int,
    service_update: ServiceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Mettre à jour un service (Admin seulement)"""
    if not current_user.can_manage_users and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas la permission de modifier des services"
        )
    
    service = db.query(ServiceModel).filter(ServiceModel.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    
    update_data = service_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(service, field, value)
    
    service.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(service)
    
    return service

@router.delete("/{service_id}")
async def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Supprimer un service (Admin seulement)"""
    if not current_user.can_manage_users and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Vous n'avez pas la permission de supprimer des services"
        )
    
    service = db.query(ServiceModel).filter(ServiceModel.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service non trouvé")
    
    # Vérifier s'il y a des demandes d'achat liées à ce service
    from models import PurchaseRequest
    related_requests = db.query(PurchaseRequest).filter(PurchaseRequest.department == service.name).count()
    if related_requests > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Impossible de supprimer ce service car {related_requests} demande(s) d'achat y sont liées"
        )
    
    db.delete(service)
    db.commit()
    
    return {"message": "Service supprimé avec succès"}

@router.get("/dashboard/stats")
async def get_services_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Statistiques des services"""
    total_services = db.query(ServiceModel).count()
    active_services = db.query(ServiceModel).filter(ServiceModel.is_active == True).count()
    inactive_services = total_services - active_services
    
    return {
        "total_services": total_services,
        "active_services": active_services,
        "inactive_services": inactive_services
    }

