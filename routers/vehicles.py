from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from database import get_db
from models import Vehicle, MaintenanceRecord, FuelRecord, VehicleStatus
from schemas import (
    VehicleCreate, VehicleUpdate, Vehicle as VehicleSchema,
    MaintenanceRecordCreate, MaintenanceRecord as MaintenanceRecordSchema,
    FuelRecordCreate, FuelRecord as FuelRecordSchema
)
import calendar

router = APIRouter(prefix="/vehicles", tags=["vehicles"])

# === GESTION DES VÉHICULES ===

@router.post("/", response_model=VehicleSchema)
async def create_vehicle(vehicle: VehicleCreate, db: Session = Depends(get_db)):
    """Créer un nouveau véhicule"""
    # Vérifier que le numéro de plaque n'existe pas déjà
    existing = db.query(Vehicle).filter(Vehicle.plate_number == vehicle.plate_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="Un véhicule avec ce numéro de plaque existe déjà")
    
    db_vehicle = Vehicle(**vehicle.dict())
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle

@router.get("/", response_model=List[VehicleSchema])
async def get_vehicles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[VehicleStatus] = None,
    brand: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Récupérer la liste des véhicules"""
    query = db.query(Vehicle)
    
    if status:
        query = query.filter(Vehicle.status == status)
    if brand:
        query = query.filter(Vehicle.brand.ilike(f"%{brand}%"))
    
    return query.offset(skip).limit(limit).all()

@router.get("/{vehicle_id}", response_model=VehicleSchema)
async def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    """Récupérer un véhicule par ID"""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Véhicule non trouvé")
    return vehicle

@router.put("/{vehicle_id}", response_model=VehicleSchema)
async def update_vehicle(
    vehicle_id: int,
    vehicle_update: VehicleUpdate,
    db: Session = Depends(get_db)
):
    """Mettre à jour un véhicule"""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Véhicule non trouvé")
    
    update_data = vehicle_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(vehicle, field, value)
    
    vehicle.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(vehicle)
    return vehicle

@router.delete("/{vehicle_id}")
async def delete_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    """Supprimer un véhicule"""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Véhicule non trouvé")
    
    db.delete(vehicle)
    db.commit()
    return {"message": "Véhicule supprimé avec succès"}

# === GESTION DE LA MAINTENANCE ===

@router.post("/{vehicle_id}/maintenance", response_model=MaintenanceRecordSchema)
async def create_maintenance_record(
    vehicle_id: int,
    maintenance: MaintenanceRecordCreate,
    db: Session = Depends(get_db)
):
    """Enregistrer une maintenance pour un véhicule"""
    # Vérifier que le véhicule existe
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Véhicule non trouvé")
    
    # Créer l'enregistrement de maintenance
    maintenance_data = maintenance.dict()
    maintenance_data["vehicle_id"] = vehicle_id
    db_maintenance = MaintenanceRecord(**maintenance_data)
    db.add(db_maintenance)
    
    # Mettre à jour le kilométrage du véhicule si fourni
    if maintenance.mileage_at_service and maintenance.mileage_at_service > vehicle.current_mileage:
        vehicle.current_mileage = maintenance.mileage_at_service
    
    db.commit()
    db.refresh(db_maintenance)
    return db_maintenance

@router.get("/{vehicle_id}/maintenance", response_model=List[MaintenanceRecordSchema])
async def get_vehicle_maintenance(
    vehicle_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Récupérer l'historique de maintenance d'un véhicule"""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Véhicule non trouvé")
    
    maintenance_records = db.query(MaintenanceRecord).filter(
        MaintenanceRecord.vehicle_id == vehicle_id
    ).order_by(MaintenanceRecord.service_date.desc()).offset(skip).limit(limit).all()
    
    return maintenance_records

@router.get("/maintenance/upcoming")
async def get_upcoming_maintenance(
    days_ahead: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Récupérer les maintenances à venir"""
    future_date = datetime.utcnow() + timedelta(days=days_ahead)
    
    upcoming = db.query(MaintenanceRecord).filter(
        MaintenanceRecord.next_service_due <= future_date,
        MaintenanceRecord.next_service_due >= datetime.utcnow()
    ).all()
    
    return {
        "days_ahead": days_ahead,
        "count": len(upcoming),
        "maintenance_records": upcoming
    }

# === GESTION DU CARBURANT ===

@router.post("/{vehicle_id}/fuel", response_model=FuelRecordSchema)
async def create_fuel_record(
    vehicle_id: int,
    fuel_record: FuelRecordCreate,
    db: Session = Depends(get_db)
):
    """Enregistrer un ravitaillement"""
    # Vérifier que le véhicule existe
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Véhicule non trouvé")
    
    # Créer l'enregistrement de carburant
    fuel_data = fuel_record.dict()
    fuel_data["vehicle_id"] = vehicle_id
    db_fuel = FuelRecord(**fuel_data)
    db.add(db_fuel)
    
    # Mettre à jour le kilométrage du véhicule si fourni
    if fuel_record.mileage_after and fuel_record.mileage_after > vehicle.current_mileage:
        vehicle.current_mileage = fuel_record.mileage_after
    
    db.commit()
    db.refresh(db_fuel)
    return db_fuel

@router.get("/{vehicle_id}/fuel", response_model=List[FuelRecordSchema])
async def get_vehicle_fuel_records(
    vehicle_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """Récupérer l'historique de carburant d'un véhicule"""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Véhicule non trouvé")
    
    query = db.query(FuelRecord).filter(FuelRecord.vehicle_id == vehicle_id)
    
    if start_date:
        query = query.filter(FuelRecord.refuel_date >= start_date)
    if end_date:
        query = query.filter(FuelRecord.refuel_date <= end_date)
    
    fuel_records = query.order_by(FuelRecord.refuel_date.desc()).offset(skip).limit(limit).all()
    return fuel_records

@router.get("/{vehicle_id}/fuel/stats")
async def get_vehicle_fuel_stats(
    vehicle_id: int,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """Statistiques de consommation de carburant pour un véhicule"""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Véhicule non trouvé")
    
    query = db.query(FuelRecord).filter(FuelRecord.vehicle_id == vehicle_id)
    
    if start_date:
        query = query.filter(FuelRecord.refuel_date >= start_date)
    if end_date:
        query = query.filter(FuelRecord.refuel_date <= end_date)
    
    fuel_records = query.order_by(FuelRecord.refuel_date.asc()).all()
    
    if not fuel_records:
        return {
            "vehicle_id": vehicle_id,
            "total_fuel": 0.0,
            "total_cost": 0.0,
            "average_price_per_liter": 0.0,
            "fuel_efficiency": 0.0,
            "records_count": 0
        }
    
    total_fuel = sum(record.quantity for record in fuel_records)
    total_cost = sum(record.total_cost for record in fuel_records)
    average_price = total_cost / total_fuel if total_fuel > 0 else 0
    
    # Calculer l'efficacité énergétique (km/litre)
    total_distance = 0
    for i in range(1, len(fuel_records)):
        if fuel_records[i].mileage_after and fuel_records[i-1].mileage_after:
            distance = fuel_records[i].mileage_after - fuel_records[i-1].mileage_after
            total_distance += distance
    
    fuel_efficiency = total_distance / total_fuel if total_fuel > 0 else 0
    
    return {
        "vehicle_id": vehicle_id,
        "total_fuel": total_fuel,
        "total_cost": total_cost,
        "average_price_per_liter": average_price,
        "fuel_efficiency": fuel_efficiency,
        "total_distance": total_distance,
        "records_count": len(fuel_records)
    }

# === RAPPORTS ET STATISTIQUES ===

@router.get("/stats/summary")
async def get_vehicles_summary(db: Session = Depends(get_db)):
    """Résumé des véhicules et de leurs coûts"""
    vehicles = db.query(Vehicle).all()
    
    if not vehicles:
        return {
            "total_vehicles": 0,
            "active_vehicles": 0,
            "total_maintenance_cost": 0.0,
            "total_fuel_cost": 0.0,
            "brands": {}
        }
    
    active_vehicles = len([v for v in vehicles if v.status == VehicleStatus.ACTIVE])
    
    # Coûts de maintenance
    maintenance_cost = db.query(MaintenanceRecord).with_entities(
        db.func.sum(MaintenanceRecord.cost)
    ).scalar() or 0.0
    
    # Coûts de carburant
    fuel_cost = db.query(FuelRecord).with_entities(
        db.func.sum(FuelRecord.total_cost)
    ).scalar() or 0.0
    
    # Statistiques par marque
    brands = {}
    for vehicle in vehicles:
        brand = vehicle.brand
        if brand not in brands:
            brands[brand] = {"count": 0, "models": set()}
        brands[brand]["count"] += 1
        brands[brand]["models"].add(vehicle.model)
    
    # Convertir les sets en listes pour la sérialisation JSON
    for brand in brands:
        brands[brand]["models"] = list(brands[brand]["models"])
    
    return {
        "total_vehicles": len(vehicles),
        "active_vehicles": active_vehicles,
        "total_maintenance_cost": maintenance_cost,
        "total_fuel_cost": fuel_cost,
        "total_operating_cost": maintenance_cost + fuel_cost,
        "brands": brands
    }

@router.get("/{vehicle_id}/history")
async def get_vehicle_complete_history(
    vehicle_id: int,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """Historique complet d'un véhicule (maintenance + carburant)"""
    vehicle = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="Véhicule non trouvé")
    
    # Récupérer la maintenance
    maintenance_query = db.query(MaintenanceRecord).filter(
        MaintenanceRecord.vehicle_id == vehicle_id
    )
    if start_date:
        maintenance_query = maintenance_query.filter(MaintenanceRecord.service_date >= start_date)
    if end_date:
        maintenance_query = maintenance_query.filter(MaintenanceRecord.service_date <= end_date)
    
    maintenance_records = maintenance_query.all()
    
    # Récupérer le carburant
    fuel_query = db.query(FuelRecord).filter(FuelRecord.vehicle_id == vehicle_id)
    if start_date:
        fuel_query = fuel_query.filter(FuelRecord.refuel_date >= start_date)
    if end_date:
        fuel_query = fuel_query.filter(FuelRecord.refuel_date <= end_date)
    
    fuel_records = fuel_query.all()
    
    # Combiner et trier par date
    all_events = []
    
    for record in maintenance_records:
        all_events.append({
            "type": "maintenance",
            "date": record.service_date,
            "description": f"{record.maintenance_type} - {record.description or ''}",
            "cost": record.cost,
            "data": record
        })
    
    for record in fuel_records:
        all_events.append({
            "type": "fuel",
            "date": record.refuel_date,
            "description": f"Ravitaillement {record.fuel_type} - {record.quantity}L",
            "cost": record.total_cost,
            "data": record
        })
    
    # Trier par date
    all_events.sort(key=lambda x: x["date"], reverse=True)
    
    return {
        "vehicle": vehicle,
        "total_events": len(all_events),
        "maintenance_count": len(maintenance_records),
        "fuel_count": len(fuel_records),
        "events": all_events
    }

