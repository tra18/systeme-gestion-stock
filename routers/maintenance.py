from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import MaintenanceRecord as MaintenanceRecordModel, Breakdown as BreakdownModel, Vehicle
from schemas import (
    MaintenanceRecordCreate, MaintenanceRecordUpdate, MaintenanceRecord,
    BreakdownCreate, BreakdownUpdate, Breakdown
)
from auth import get_current_active_user
from typing import List, Optional
from datetime import datetime, timedelta

router = APIRouter()

# Routes pour les entretiens
@router.post("/maintenance/", response_model=MaintenanceRecord)
async def create_maintenance_record(
    maintenance: MaintenanceRecordCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Créer un nouvel enregistrement d'entretien"""
    # Vérifier que le véhicule existe
    vehicle = db.query(Vehicle).filter(Vehicle.id == maintenance.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Véhicule non trouvé")
    
    db_maintenance = MaintenanceRecordModel(**maintenance.dict())
    db.add(db_maintenance)
    db.commit()
    db.refresh(db_maintenance)
    return db_maintenance

@router.get("/maintenance/", response_model=List[MaintenanceRecord])
async def get_maintenance_records(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    vehicle_id: Optional[int] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Récupérer les enregistrements d'entretien avec filtres"""
    query = db.query(MaintenanceRecordModel)
    
    if vehicle_id:
        query = query.filter(MaintenanceRecordModel.vehicle_id == vehicle_id)
    
    if start_date:
        start_dt = datetime.fromisoformat(start_date)
        query = query.filter(MaintenanceRecordModel.service_date >= start_dt)
    
    if end_date:
        end_dt = datetime.fromisoformat(end_date)
        query = query.filter(MaintenanceRecordModel.service_date <= end_dt)
    
    return query.order_by(MaintenanceRecordModel.service_date.desc()).offset(skip).limit(limit).all()

@router.get("/maintenance/{maintenance_id}", response_model=MaintenanceRecord)
async def get_maintenance_record(
    maintenance_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Récupérer un enregistrement d'entretien spécifique"""
    maintenance = db.query(MaintenanceRecord).filter(MaintenanceRecordModel.id == maintenance_id).first()
    if not maintenance:
        raise HTTPException(status_code=404, detail="Enregistrement d'entretien non trouvé")
    return maintenance

@router.put("/maintenance/{maintenance_id}", response_model=MaintenanceRecord)
async def update_maintenance_record(
    maintenance_id: int,
    maintenance_update: MaintenanceRecordUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Mettre à jour un enregistrement d'entretien"""
    maintenance = db.query(MaintenanceRecord).filter(MaintenanceRecordModel.id == maintenance_id).first()
    if not maintenance:
        raise HTTPException(status_code=404, detail="Enregistrement d'entretien non trouvé")
    
    for field, value in maintenance_update.dict(exclude_unset=True).items():
        setattr(maintenance, field, value)
    
    db.commit()
    db.refresh(maintenance)
    return maintenance

@router.delete("/maintenance/{maintenance_id}")
async def delete_maintenance_record(
    maintenance_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Supprimer un enregistrement d'entretien"""
    maintenance = db.query(MaintenanceRecord).filter(MaintenanceRecordModel.id == maintenance_id).first()
    if not maintenance:
        raise HTTPException(status_code=404, detail="Enregistrement d'entretien non trouvé")
    
    db.delete(maintenance)
    db.commit()
    return {"message": "Enregistrement d'entretien supprimé avec succès"}

# Routes pour les pannes
@router.post("/breakdowns/", response_model=Breakdown)
async def create_breakdown(
    breakdown: BreakdownCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Créer un nouvel enregistrement de panne"""
    # Vérifier que le véhicule existe
    vehicle = db.query(Vehicle).filter(Vehicle.id == breakdown.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Véhicule non trouvé")
    
    db_breakdown = BreakdownModel(**breakdown.dict())
    db.add(db_breakdown)
    db.commit()
    db.refresh(db_breakdown)
    return db_breakdown

@router.get("/breakdowns/", response_model=List[Breakdown])
async def get_breakdowns(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    vehicle_id: Optional[int] = Query(None),
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    is_repaired: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Récupérer les enregistrements de pannes avec filtres"""
    query = db.query(BreakdownModel)
    
    if vehicle_id:
        query = query.filter(BreakdownModel.vehicle_id == vehicle_id)
    
    if start_date:
        start_dt = datetime.fromisoformat(start_date)
        query = query.filter(BreakdownModel.breakdown_date >= start_dt)
    
    if end_date:
        end_dt = datetime.fromisoformat(end_date)
        query = query.filter(BreakdownModel.breakdown_date <= end_dt)
    
    if is_repaired is not None:
        query = query.filter(BreakdownModel.is_repaired == is_repaired)
    
    return query.order_by(BreakdownModel.breakdown_date.desc()).offset(skip).limit(limit).all()

@router.get("/breakdowns/{breakdown_id}", response_model=Breakdown)
async def get_breakdown(
    breakdown_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Récupérer un enregistrement de panne spécifique"""
    breakdown = db.query(Breakdown).filter(BreakdownModel.id == breakdown_id).first()
    if not breakdown:
        raise HTTPException(status_code=404, detail="Enregistrement de panne non trouvé")
    return breakdown

@router.put("/breakdowns/{breakdown_id}", response_model=Breakdown)
async def update_breakdown(
    breakdown_id: int,
    breakdown_update: BreakdownUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Mettre à jour un enregistrement de panne"""
    breakdown = db.query(Breakdown).filter(BreakdownModel.id == breakdown_id).first()
    if not breakdown:
        raise HTTPException(status_code=404, detail="Enregistrement de panne non trouvé")
    
    for field, value in breakdown_update.dict(exclude_unset=True).items():
        setattr(breakdown, field, value)
    
    db.commit()
    db.refresh(breakdown)
    return breakdown

@router.delete("/breakdowns/{breakdown_id}")
async def delete_breakdown(
    breakdown_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Supprimer un enregistrement de panne"""
    breakdown = db.query(Breakdown).filter(BreakdownModel.id == breakdown_id).first()
    if not breakdown:
        raise HTTPException(status_code=404, detail="Enregistrement de panne non trouvé")
    
    db.delete(breakdown)
    db.commit()
    return {"message": "Enregistrement de panne supprimé avec succès"}

# Routes pour les rappels et statistiques
@router.get("/maintenance/reminders/")
async def get_maintenance_reminders(
    days_ahead: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Récupérer les entretiens à venir dans les X jours"""
    future_date = datetime.utcnow() + timedelta(days=days_ahead)
    
    reminders = db.query(MaintenanceRecordModel).filter(
        MaintenanceRecordModel.next_service_due <= future_date,
        MaintenanceRecordModel.next_service_due >= datetime.utcnow()
    ).all()
    
    return {
        "reminders": reminders,
        "count": len(reminders),
        "days_ahead": days_ahead
    }

@router.get("/maintenance/stats/")
async def get_maintenance_stats(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Récupérer les statistiques des entretiens"""
    query = db.query(MaintenanceRecordModel)
    
    if start_date:
        start_dt = datetime.fromisoformat(start_date)
        query = query.filter(MaintenanceRecordModel.service_date >= start_dt)
    
    if end_date:
        end_dt = datetime.fromisoformat(end_date)
        query = query.filter(MaintenanceRecordModel.service_date <= end_dt)
    
    records = query.all()
    
    total_cost = sum(record.cost for record in records)
    total_records = len(records)
    
    # Statistiques par type d'entretien
    type_stats = {}
    for record in records:
        if record.maintenance_type not in type_stats:
            type_stats[record.maintenance_type] = {"count": 0, "total_cost": 0}
        type_stats[record.maintenance_type]["count"] += 1
        type_stats[record.maintenance_type]["total_cost"] += record.cost
    
    return {
        "total_records": total_records,
        "total_cost": total_cost,
        "average_cost": total_cost / total_records if total_records > 0 else 0,
        "type_statistics": type_stats
    }

@router.get("/breakdowns/stats/")
async def get_breakdown_stats(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Récupérer les statistiques des pannes"""
    query = db.query(BreakdownModel)
    
    if start_date:
        start_dt = datetime.fromisoformat(start_date)
        query = query.filter(BreakdownModel.breakdown_date >= start_dt)
    
    if end_date:
        end_dt = datetime.fromisoformat(end_date)
        query = query.filter(BreakdownModel.breakdown_date <= end_dt)
    
    breakdowns = query.all()
    
    total_cost = sum(breakdown.cost for breakdown in breakdowns)
    total_breakdowns = len(breakdowns)
    repaired_count = sum(1 for breakdown in breakdowns if breakdown.is_repaired)
    
    # Statistiques par type de panne
    type_stats = {}
    for breakdown in breakdowns:
        if breakdown.breakdown_type not in type_stats:
            type_stats[breakdown.breakdown_type] = {"count": 0, "total_cost": 0}
        type_stats[breakdown.breakdown_type]["count"] += 1
        type_stats[breakdown.breakdown_type]["total_cost"] += breakdown.cost
    
    return {
        "total_breakdowns": total_breakdowns,
        "repaired_count": repaired_count,
        "pending_count": total_breakdowns - repaired_count,
        "total_cost": total_cost,
        "average_cost": total_cost / total_breakdowns if total_breakdowns > 0 else 0,
        "type_statistics": type_stats
    }
