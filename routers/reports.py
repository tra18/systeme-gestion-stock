from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from database import get_db
from models import (
    Purchase, StockItem, StockMovement, Vehicle, 
    MaintenanceRecord, FuelRecord, PurchaseCategory, PurchasePeriod
)
from schemas import DashboardStats
import calendar

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Tableau de bord principal avec toutes les statistiques"""
    
    # Statistiques des achats
    total_purchases = db.query(func.sum(Purchase.amount)).scalar() or 0.0
    
    # Statistiques des véhicules
    total_vehicles = db.query(Vehicle).count()
    
    # Articles en stock bas
    low_stock_items = db.query(StockItem).filter(
        and_(
            StockItem.is_active == True,
            StockItem.current_quantity <= StockItem.min_threshold
        )
    ).count()
    
    # Maintenances à venir (dans les 30 prochains jours)
    upcoming_maintenance = db.query(MaintenanceRecord).filter(
        and_(
            MaintenanceRecord.next_service_due >= datetime.utcnow(),
            MaintenanceRecord.next_service_due <= datetime.utcnow() + timedelta(days=30)
        )
    ).count()
    
    # Activités récentes (derniers 7 jours)
    recent_activities = []
    
    # Achats récents
    recent_purchases = db.query(Purchase).filter(
        Purchase.purchase_date >= datetime.utcnow() - timedelta(days=7)
    ).order_by(Purchase.purchase_date.desc()).limit(5).all()
    
    for purchase in recent_purchases:
        recent_activities.append({
            "type": "purchase",
            "date": purchase.purchase_date,
            "description": f"Achat: {purchase.item_name} - {purchase.amount}€",
            "amount": purchase.amount
        })
    
    # Mouvements de stock récents
    recent_movements = db.query(StockMovement).filter(
        StockMovement.created_at >= datetime.utcnow() - timedelta(days=7)
    ).order_by(StockMovement.created_at.desc()).limit(5).all()
    
    for movement in recent_movements:
        item = db.query(StockItem).filter(StockItem.id == movement.stock_item_id).first()
        if item:
            recent_activities.append({
                "type": "stock_movement",
                "date": movement.created_at,
                "description": f"Stock {movement.movement_type}: {item.name} ({movement.quantity})",
                "quantity": movement.quantity
            })
    
    # Maintenances récentes
    recent_maintenance = db.query(MaintenanceRecord).filter(
        MaintenanceRecord.service_date >= datetime.utcnow() - timedelta(days=7)
    ).order_by(MaintenanceRecord.service_date.desc()).limit(5).all()
    
    for maintenance in recent_maintenance:
        vehicle = db.query(Vehicle).filter(Vehicle.id == maintenance.vehicle_id).first()
        if vehicle:
            recent_activities.append({
                "type": "maintenance",
                "date": maintenance.service_date,
                "description": f"Maintenance: {vehicle.plate_number} - {maintenance.maintenance_type}",
                "cost": maintenance.cost
            })
    
    # Trier les activités par date
    recent_activities.sort(key=lambda x: x["date"], reverse=True)
    
    return DashboardStats(
        total_purchases=total_purchases,
        total_vehicles=total_vehicles,
        low_stock_items=low_stock_items,
        upcoming_maintenance=upcoming_maintenance,
        recent_activities=recent_activities[:10]  # Limiter à 10 activités
    )

@router.get("/purchases/period")
async def get_purchase_period_report(
    period: PurchasePeriod,
    year: int = Query(..., description="Année"),
    month: Optional[int] = Query(None, description="Mois (pour les rapports mensuels)"),
    week: Optional[int] = Query(None, description="Semaine (pour les rapports hebdomadaires)"),
    db: Session = Depends(get_db)
):
    """Rapport détaillé des achats par période"""
    
    # Calculer les dates selon la période
    if period == PurchasePeriod.DAILY:
        if not month:
            raise HTTPException(status_code=400, detail="Le mois est requis pour les rapports journaliers")
        start_date = datetime(year, month, 1)
        end_date = datetime(year, month, calendar.monthrange(year, month)[1])
    elif period == PurchasePeriod.WEEKLY:
        if not week:
            raise HTTPException(status_code=400, detail="La semaine est requise pour les rapports hebdomadaires")
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
    
    # Récupérer les achats
    purchases = db.query(Purchase).filter(
        and_(
            Purchase.purchase_date >= start_date,
            Purchase.purchase_date <= end_date
        )
    ).all()
    
    # Statistiques générales
    total_amount = sum(p.amount for p in purchases)
    total_items = len(purchases)
    average_amount = total_amount / total_items if total_items > 0 else 0
    
    # Répartition par catégorie
    category_breakdown = {}
    for purchase in purchases:
        cat = purchase.category
        if cat not in category_breakdown:
            category_breakdown[cat] = {
                "count": 0,
                "amount": 0.0,
                "percentage": 0.0
            }
        category_breakdown[cat]["count"] += 1
        category_breakdown[cat]["amount"] += purchase.amount
    
    # Calculer les pourcentages
    for cat in category_breakdown:
        category_breakdown[cat]["percentage"] = (
            category_breakdown[cat]["amount"] / total_amount * 100
            if total_amount > 0 else 0
        )
    
    # Top 5 des fournisseurs
    supplier_stats = {}
    for purchase in purchases:
        if purchase.supplier:
            supplier = purchase.supplier
            if supplier not in supplier_stats:
                supplier_stats[supplier] = {"count": 0, "amount": 0.0}
            supplier_stats[supplier]["count"] += 1
            supplier_stats[supplier]["amount"] += purchase.amount
    
    top_suppliers = sorted(
        supplier_stats.items(),
        key=lambda x: x[1]["amount"],
        reverse=True
    )[:5]
    
    return {
        "period": f"{period.value}_{year}",
        "start_date": start_date,
        "end_date": end_date,
        "summary": {
            "total_amount": total_amount,
            "total_items": total_items,
            "average_amount": average_amount
        },
        "category_breakdown": category_breakdown,
        "top_suppliers": [{"supplier": s[0], **s[1]} for s in top_suppliers],
        "purchases": purchases
    }

@router.get("/stock/analysis")
async def get_stock_analysis(
    category: Optional[PurchaseCategory] = None,
    low_stock_only: bool = False,
    db: Session = Depends(get_db)
):
    """Analyse détaillée du stock"""
    
    query = db.query(StockItem).filter(StockItem.is_active == True)
    
    if category:
        query = query.filter(StockItem.category == category)
    
    if low_stock_only:
        query = query.filter(StockItem.current_quantity <= StockItem.min_threshold)
    
    items = query.all()
    
    if not items:
        return {
            "total_items": 0,
            "total_value": 0.0,
            "low_stock_count": 0,
            "out_of_stock_count": 0,
            "categories": {},
            "recommendations": []
        }
    
    # Statistiques générales
    total_value = sum(item.current_quantity * item.unit_cost for item in items)
    low_stock_count = len([item for item in items if item.current_quantity <= item.min_threshold])
    out_of_stock_count = len([item for item in items if item.current_quantity == 0])
    
    # Analyse par catégorie
    categories = {}
    for item in items:
        cat = item.category
        if cat not in categories:
            categories[cat] = {
                "count": 0,
                "total_quantity": 0,
                "total_value": 0.0,
                "low_stock": 0,
                "out_of_stock": 0
            }
        categories[cat]["count"] += 1
        categories[cat]["total_quantity"] += item.current_quantity
        categories[cat]["total_value"] += item.current_quantity * item.unit_cost
        if item.current_quantity <= item.min_threshold:
            categories[cat]["low_stock"] += 1
        if item.current_quantity == 0:
            categories[cat]["out_of_stock"] += 1
    
    # Recommandations
    recommendations = []
    
    # Articles en rupture
    out_of_stock = [item for item in items if item.current_quantity == 0]
    if out_of_stock:
        recommendations.append({
            "type": "critical",
            "message": f"{len(out_of_stock)} article(s) en rupture de stock",
            "items": [{"name": item.name, "location": item.location} for item in out_of_stock]
        })
    
    # Articles en stock bas
    low_stock = [item for item in items if 0 < item.current_quantity <= item.min_threshold]
    if low_stock:
        recommendations.append({
            "type": "warning",
            "message": f"{len(low_stock)} article(s) en stock bas",
            "items": [{"name": item.name, "current": item.current_quantity, "min": item.min_threshold} for item in low_stock]
        })
    
    # Articles surstockés
    overstocked = [item for item in items if item.current_quantity > item.max_threshold]
    if overstocked:
        recommendations.append({
            "type": "info",
            "message": f"{len(overstocked)} article(s) surstockés",
            "items": [{"name": item.name, "current": item.current_quantity, "max": item.max_threshold} for item in overstocked]
        })
    
    return {
        "total_items": len(items),
        "total_value": total_value,
        "low_stock_count": low_stock_count,
        "out_of_stock_count": out_of_stock_count,
        "categories": categories,
        "recommendations": recommendations
    }

@router.get("/vehicles/costs")
async def get_vehicle_costs_report(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    vehicle_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Rapport des coûts des véhicules"""
    
    # Coûts de maintenance
    maintenance_query = db.query(MaintenanceRecord)
    if start_date:
        maintenance_query = maintenance_query.filter(MaintenanceRecord.service_date >= start_date)
    if end_date:
        maintenance_query = maintenance_query.filter(MaintenanceRecord.service_date <= end_date)
    if vehicle_id:
        maintenance_query = maintenance_query.filter(MaintenanceRecord.vehicle_id == vehicle_id)
    
    maintenance_records = maintenance_query.all()
    total_maintenance_cost = sum(record.cost for record in maintenance_records)
    
    # Coûts de carburant
    fuel_query = db.query(FuelRecord)
    if start_date:
        fuel_query = fuel_query.filter(FuelRecord.refuel_date >= start_date)
    if end_date:
        fuel_query = fuel_query.filter(FuelRecord.refuel_date <= end_date)
    if vehicle_id:
        fuel_query = fuel_query.filter(FuelRecord.vehicle_id == vehicle_id)
    
    fuel_records = fuel_query.all()
    total_fuel_cost = sum(record.total_cost for record in fuel_records)
    
    # Coûts par véhicule
    vehicle_costs = {}
    for record in maintenance_records:
        if record.vehicle_id not in vehicle_costs:
            vehicle_costs[record.vehicle_id] = {"maintenance": 0.0, "fuel": 0.0}
        vehicle_costs[record.vehicle_id]["maintenance"] += record.cost
    
    for record in fuel_records:
        if record.vehicle_id not in vehicle_costs:
            vehicle_costs[record.vehicle_id] = {"maintenance": 0.0, "fuel": 0.0}
        vehicle_costs[record.vehicle_id]["fuel"] += record.total_cost
    
    # Ajouter les informations des véhicules
    vehicle_details = {}
    for vid in vehicle_costs.keys():
        vehicle = db.query(Vehicle).filter(Vehicle.id == vid).first()
        if vehicle:
            vehicle_details[vid] = {
                "plate_number": vehicle.plate_number,
                "brand": vehicle.brand,
                "model": vehicle.model,
                "current_mileage": vehicle.current_mileage
            }
    
    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "summary": {
            "total_maintenance_cost": total_maintenance_cost,
            "total_fuel_cost": total_fuel_cost,
            "total_operating_cost": total_maintenance_cost + total_fuel_cost,
            "maintenance_count": len(maintenance_records),
            "fuel_count": len(fuel_records)
        },
        "vehicle_costs": {
            vid: {
                **vehicle_details.get(vid, {}),
                **costs,
                "total_cost": costs["maintenance"] + costs["fuel"]
            }
            for vid, costs in vehicle_costs.items()
        }
    }

@router.get("/financial/summary")
async def get_financial_summary(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    """Résumé financier global"""
    
    # Achats
    purchase_query = db.query(Purchase)
    if start_date:
        purchase_query = purchase_query.filter(Purchase.purchase_date >= start_date)
    if end_date:
        purchase_query = purchase_query.filter(Purchase.purchase_date <= end_date)
    
    purchases = purchase_query.all()
    total_purchases = sum(p.amount for p in purchases)
    
    # Coûts de maintenance
    maintenance_query = db.query(MaintenanceRecord)
    if start_date:
        maintenance_query = maintenance_query.filter(MaintenanceRecord.service_date >= start_date)
    if end_date:
        maintenance_query = maintenance_query.filter(MaintenanceRecord.service_date <= end_date)
    
    maintenance_records = maintenance_query.all()
    total_maintenance = sum(record.cost for record in maintenance_records)
    
    # Coûts de carburant
    fuel_query = db.query(FuelRecord)
    if start_date:
        fuel_query = fuel_query.filter(FuelRecord.refuel_date >= start_date)
    if end_date:
        fuel_query = fuel_query.filter(FuelRecord.refuel_date <= end_date)
    
    fuel_records = fuel_query.all()
    total_fuel = sum(record.total_cost for record in fuel_records)
    
    # Valeur du stock actuel
    stock_items = db.query(StockItem).filter(StockItem.is_active == True).all()
    stock_value = sum(item.current_quantity * item.unit_cost for item in stock_items)
    
    return {
        "period": {
            "start_date": start_date,
            "end_date": end_date
        },
        "expenses": {
            "purchases": total_purchases,
            "maintenance": total_maintenance,
            "fuel": total_fuel,
            "total_expenses": total_purchases + total_maintenance + total_fuel
        },
        "assets": {
            "stock_value": stock_value,
            "total_vehicles": db.query(Vehicle).count()
        },
        "summary": {
            "net_expenses": total_purchases + total_maintenance + total_fuel,
            "asset_value": stock_value,
            "expense_breakdown": {
                "purchases_percentage": (total_purchases / (total_purchases + total_maintenance + total_fuel) * 100) if (total_purchases + total_maintenance + total_fuel) > 0 else 0,
                "maintenance_percentage": (total_maintenance / (total_purchases + total_maintenance + total_fuel) * 100) if (total_purchases + total_maintenance + total_fuel) > 0 else 0,
                "fuel_percentage": (total_fuel / (total_purchases + total_maintenance + total_fuel) * 100) if (total_purchases + total_maintenance + total_fuel) > 0 else 0
            }
        }
    }
