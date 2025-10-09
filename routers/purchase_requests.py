from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uuid

from database import get_db
from models import PurchaseRequest as PurchaseRequestModel, User, Supplier
from schemas import (
    PurchaseRequestCreate, 
    PurchaseRequestUpdate, 
    PurchaseRequest, 
    PurchaseRequestApproval,
    PurchaseRequestReceipt
)
from auth import get_current_active_user

router = APIRouter(prefix="/purchase-requests", tags=["purchase-requests"])

def generate_request_number():
    """Génère un numéro de demande unique"""
    timestamp = datetime.now().strftime("%Y%m%d")
    unique_id = str(uuid.uuid4())[:8].upper()
    return f"DEM-{timestamp}-{unique_id}"

def generate_order_number():
    """Génère un numéro de commande unique"""
    timestamp = datetime.now().strftime("%Y%m%d")
    unique_id = str(uuid.uuid4())[:8].upper()
    return f"CMD-{timestamp}-{unique_id}"

@router.post("/", response_model=PurchaseRequest, status_code=status.HTTP_201_CREATED)
async def create_purchase_request(
    request: PurchaseRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Créer une nouvelle demande d'achat (Service)"""
    # Générer le numéro de demande
    request_number = generate_request_number()
    
    db_request = PurchaseRequestModel(
        request_number=request_number,
        item_name=request.item_name,
        description=request.description,
        category=request.category.value,
        quantity=request.quantity,
        unit=request.unit,
        urgency=request.urgency,
        justification=request.justification,
        department=request.department,
        status="pending",
        requested_by=current_user.full_name,
        requested_by_user_id=current_user.id
    )
    
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    
    return db_request

@router.get("/", response_model=List[PurchaseRequest])
async def get_purchase_requests(
    status_filter: Optional[str] = Query(None, description="Filtrer par statut"),
    department: Optional[str] = Query(None, description="Filtrer par département"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Récupérer les demandes d'achat avec filtres"""
    query = db.query(PurchaseRequestModel)
    
    # Filtres selon le rôle de l'utilisateur
    if current_user.role == "admin":
        # Admin voit tout
        pass
    elif current_user.role == "manager":
        # Manager voit les demandes de son département
        query = query.filter(PurchaseRequestModel.department == current_user.full_name)
    else:
        # Utilisateur normal voit ses propres demandes
        query = query.filter(PurchaseRequestModel.requested_by_user_id == current_user.id)
    
    # Appliquer les filtres optionnels
    if status_filter:
        query = query.filter(PurchaseRequestModel.status == status_filter)
    if department:
        query = query.filter(PurchaseRequestModel.department == department)
    
    return query.order_by(PurchaseRequestModel.created_at.desc()).all()

@router.get("/{request_id}", response_model=PurchaseRequest)
async def get_purchase_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Récupérer une demande d'achat spécifique"""
    request = db.query(PurchaseRequestModel).filter(PurchaseRequestModel.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Demande d'achat non trouvée")
    
    # Vérifier les permissions
    if (current_user.role != "admin" and 
        request.requested_by_user_id != current_user.id):
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    return request

@router.put("/{request_id}/approve-dg", response_model=PurchaseRequest)
async def approve_by_dg(
    request_id: int,
    approval: PurchaseRequestApproval,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Approuver/Rejeter une demande par le DG"""
    # Vérifier que l'utilisateur est DG ou Admin
    if current_user.role not in ["admin", "manager"]:
        raise HTTPException(status_code=403, detail="Seul le DG peut approuver les demandes")
    
    request = db.query(PurchaseRequestModel).filter(PurchaseRequestModel.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Demande d'achat non trouvée")
    
    if request.status != "pending":
        raise HTTPException(status_code=400, detail="Cette demande a déjà été traitée")
    
    if approval.action == "approve":
        request.status = "approved_by_dg"
        request.approved_by_dg_at = datetime.utcnow()
        request.approved_by_dg_user_id = current_user.id
        request.dg_signature = approval.signature
    else:
        request.status = "rejected"
        request.rejected_at = datetime.utcnow()
        request.rejected_by_user_id = current_user.id
        request.rejection_reason = approval.reason
    
    db.commit()
    db.refresh(request)
    return request

@router.put("/{request_id}/approve-purchase", response_model=PurchaseRequest)
async def approve_by_purchase(
    request_id: int,
    supplier_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Approuver une demande par le service achat et créer la commande"""
    # Vérifier que l'utilisateur a les permissions d'achat
    if not current_user.can_access_purchases:
        raise HTTPException(status_code=403, detail="Accès non autorisé au service achat")
    
    request = db.query(PurchaseRequestModel).filter(PurchaseRequestModel.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Demande d'achat non trouvée")
    
    if request.status != "approved_by_dg":
        raise HTTPException(status_code=400, detail="Cette demande doit d'abord être approuvée par le DG")
    
    # Vérifier que le fournisseur existe
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not supplier:
        raise HTTPException(status_code=404, detail="Fournisseur non trouvé")
    
    # Générer le numéro de commande
    order_number = generate_order_number()
    
    # Mettre à jour la demande
    request.status = "approved_by_purchase"
    request.approved_by_purchase_at = datetime.utcnow()
    request.approved_by_purchase_user_id = current_user.id
    request.supplier_id = supplier_id
    request.order_number = order_number
    
    db.commit()
    db.refresh(request)
    return request

@router.put("/{request_id}/complete", response_model=PurchaseRequest)
async def complete_purchase_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Marquer une commande comme terminée"""
    request = db.query(PurchaseRequestModel).filter(PurchaseRequestModel.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Demande d'achat non trouvée")
    
    if request.status != "approved_by_purchase":
        raise HTTPException(status_code=400, detail="Cette commande n'est pas encore approuvée par le service achat")
    
    request.status = "completed"
    db.commit()
    db.refresh(request)
    return request

@router.get("/dashboard/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Statistiques du tableau de bord des demandes d'achat"""
    query = db.query(PurchaseRequestModel)
    
    # Filtres selon le rôle
    if current_user.role not in ["admin", "manager"]:
        query = query.filter(PurchaseRequestModel.requested_by_user_id == current_user.id)
    
    total_requests = query.count()
    pending_requests = query.filter(PurchaseRequestModel.status == "pending").count()
    approved_by_dg = query.filter(PurchaseRequestModel.status == "approved_by_dg").count()
    approved_by_purchase = query.filter(PurchaseRequestModel.status == "approved_by_purchase").count()
    completed_requests = query.filter(PurchaseRequestModel.status == "completed").count()
    rejected_requests = query.filter(PurchaseRequestModel.status == "rejected").count()
    
    return {
        "total_requests": total_requests,
        "pending_requests": pending_requests,
        "approved_by_dg": approved_by_dg,
        "approved_by_purchase": approved_by_purchase,
        "completed_requests": completed_requests,
        "rejected_requests": rejected_requests
    }

@router.put("/{request_id}/receive", response_model=PurchaseRequest)
async def receive_purchase_request(
    request_id: int,
    receipt: PurchaseRequestReceipt,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Marquer une commande comme reçue avec signature"""
    request = db.query(PurchaseRequestModel).filter(PurchaseRequestModel.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Demande d'achat non trouvée")
    
    if request.status != "approved_by_purchase":
        raise HTTPException(status_code=400, detail="Cette commande n'est pas encore approuvée par le service achat")
    
    # Mettre à jour la demande avec les informations de réception
    request.status = "received"
    request.received_at = datetime.utcnow()
    request.received_by = receipt.received_by
    request.received_by_user_id = current_user.id
    request.receipt_signature = receipt.signature
    request.receipt_notes = receipt.receipt_notes
    
    db.commit()
    db.refresh(request)
    return request
