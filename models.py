from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
from enum import Enum

Base = declarative_base()

class UserRole(str, Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    USER = "user"
    VIEWER = "viewer"

class PurchasePeriod(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    SEMESTRIAL = "semestrial"
    ANNUAL = "annual"

class PurchaseCategory(str, Enum):
    OFFICE_SUPPLIES = "office_supplies"
    EQUIPMENT = "equipment"
    MAINTENANCE = "maintenance"
    FUEL = "fuel"
    FOOD = "food"
    CLEANING = "cleaning"
    SECURITY = "security"
    OTHER = "other"

class VehicleStatus(str, Enum):
    ACTIVE = "active"
    MAINTENANCE = "maintenance"
    OUT_OF_SERVICE = "out_of_service"

# Modèle pour les achats
class Purchase(Base):
    __tablename__ = "purchases"
    
    id = Column(Integer, primary_key=True, index=True)
    item_name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(50), nullable=False)  # PurchaseCategory
    period = Column(String(20), nullable=False)    # PurchasePeriod
    amount = Column(Float, nullable=False)
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, nullable=False)
    total = Column(Float, nullable=False)  # Total calculé automatiquement
    supplier = Column(String(255))
    purchase_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    stock_items = relationship("StockItem", back_populates="purchase")

# Modèle pour le stock
class StockItem(Base):
    __tablename__ = "stock_items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(50), nullable=False)
    current_quantity = Column(Integer, default=0)
    min_threshold = Column(Integer, default=0)  # Seuil minimum
    max_threshold = Column(Integer, default=100)  # Seuil maximum
    unit = Column(String(50), default="unit")  # unité (kg, litre, pièce, etc.)
    location = Column(String(255))  # Emplacement dans l'entrepôt
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relation avec les achats
    purchase_id = Column(Integer, ForeignKey("purchases.id"))
    purchase = relationship("Purchase", back_populates="stock_items")
    
    # Relation avec les mouvements de stock
    stock_movements = relationship("StockMovement", back_populates="stock_item")

# Modèle pour les mouvements de stock
class StockMovement(Base):
    __tablename__ = "stock_movements"
    
    id = Column(Integer, primary_key=True, index=True)
    stock_item_id = Column(Integer, ForeignKey("stock_items.id"), nullable=False)
    movement_type = Column(String(20), nullable=False)  # "entry" ou "exit"
    quantity = Column(Integer, nullable=False)  # Quantité positive
    reason = Column(String(255))  # Raison du mouvement
    reference = Column(String(100))  # Référence (numéro d'achat, numéro de sortie, etc.)
    user_id = Column(Integer, ForeignKey("users.id"))  # Utilisateur qui a effectué le mouvement
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relations
    stock_item = relationship("StockItem", back_populates="stock_movements")
    user = relationship("User")

# Modèle pour les véhicules
class Vehicle(Base):
    __tablename__ = "vehicles"
    
    id = Column(Integer, primary_key=True, index=True)
    plate_number = Column(String(20), unique=True, nullable=False)
    brand = Column(String(100), nullable=False)
    model = Column(String(100), nullable=False)
    year = Column(Integer)
    color = Column(String(50))
    status = Column(String(20), default="active")  # VehicleStatus
    purchase_date = Column(DateTime)
    initial_mileage = Column(Integer, default=0)
    current_mileage = Column(Integer, default=0)
    fuel_type = Column(String(50))  # Essence, Diesel, Électrique, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    maintenance_records = relationship("MaintenanceRecord", back_populates="vehicle")
    fuel_records = relationship("FuelRecord", back_populates="vehicle")
    breakdowns = relationship("Breakdown", back_populates="vehicle")

# Modèle pour les enregistrements de maintenance
class MaintenanceRecord(Base):
    __tablename__ = "maintenance_records"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    maintenance_type = Column(String(100), nullable=False)  # Révision, réparation, etc.
    description = Column(Text)
    cost = Column(Float, default=0.0)
    mileage_at_service = Column(Integer)
    service_date = Column(DateTime, nullable=False)
    next_service_due = Column(DateTime)
    service_provider = Column(String(255))
    # is_scheduled = Column(Boolean, default=False)  # Entretien programmé ou non
    # reminder_sent = Column(Boolean, default=False)  # Rappel envoyé
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relation avec le véhicule
    vehicle = relationship("Vehicle", back_populates="maintenance_records")

# Modèle pour les pannes et dépannages
class Breakdown(Base):
    __tablename__ = "breakdowns"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    breakdown_type = Column(String(100), nullable=False)  # Panne moteur, freinage, etc.
    description = Column(Text, nullable=False)
    location = Column(String(255))  # Lieu de la panne
    breakdown_date = Column(DateTime, nullable=False)
    repair_date = Column(DateTime)
    cost = Column(Float, default=0.0)
    repair_provider = Column(String(255))
    mileage_at_breakdown = Column(Integer)
    is_repaired = Column(Boolean, default=False)
    repair_notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relation avec le véhicule
    vehicle = relationship("Vehicle", back_populates="breakdowns")

class ServiceProvider(Base):
    __tablename__ = "service_providers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    contact_person = Column(String(255))
    email = Column(String(100))
    phone = Column(String(50))
    address = Column(Text)
    city = Column(String(100))
    country = Column(String(100), default="Guinée")
    service_type = Column(String(100), nullable=False)  # Mécanique, carrosserie, électricité, etc.
    specialization = Column(String(255))  # Spécialisation (moteur, freinage, etc.)
    rating = Column(Float, default=0.0)  # Note de 0 à 5
    is_active = Column(Boolean, default=True)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Modèle pour les enregistrements de carburant
class FuelRecord(Base):
    __tablename__ = "fuel_records"
    
    id = Column(Integer, primary_key=True, index=True)
    vehicle_id = Column(Integer, ForeignKey("vehicles.id"))
    fuel_type = Column(String(50), nullable=False)
    quantity = Column(Float, nullable=False)  # en litres
    price_per_liter = Column(Float, nullable=False)
    total_cost = Column(Float, nullable=False)
    mileage_before = Column(Integer)
    mileage_after = Column(Integer)
    fuel_station = Column(String(255))
    refuel_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relation avec le véhicule
    vehicle = relationship("Vehicle", back_populates="fuel_records")

# Modèle pour les utilisateurs
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    full_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="user")  # UserRole
    is_active = Column(Boolean, default=True)
    # Permissions par page
    can_access_purchases = Column(Boolean, default=True)
    can_access_stock = Column(Boolean, default=True)
    can_access_vehicles = Column(Boolean, default=True)
    can_access_maintenance = Column(Boolean, default=True)
    can_access_suppliers = Column(Boolean, default=True)
    can_access_service_providers = Column(Boolean, default=True)
    can_access_reports = Column(Boolean, default=True)
    can_manage_users = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime)

# Modèle pour les fournisseurs
class Supplier(Base):
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    contact_person = Column(String(255))
    email = Column(String(100))
    phone = Column(String(50))
    address = Column(Text)
    city = Column(String(100))
    country = Column(String(100), default="Guinée")
    tax_number = Column(String(100))  # Numéro fiscal
    payment_terms = Column(String(100))  # Conditions de paiement
    notes = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    # purchases = relationship("Purchase", back_populates="supplier_rel")

# Modèle pour les demandes d'achat avec workflow de validation
class PurchaseRequest(Base):
    __tablename__ = "purchase_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    request_number = Column(String(50), unique=True, nullable=False, index=True)  # Numéro de demande
    item_name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(50), nullable=False)  # PurchaseCategory
    quantity = Column(Integer, nullable=False)
    unit = Column(String(50), default="pièce")
    urgency = Column(String(20), default="normal")  # low, normal, high, urgent
    justification = Column(Text)  # Justification de la demande
    
    # Workflow de validation
    status = Column(String(20), default="pending")  # pending, approved_by_dg, approved_by_purchase, rejected, completed
    requested_by = Column(String(100), nullable=False)  # Nom du demandeur
    requested_by_user_id = Column(Integer, ForeignKey("users.id"))  # ID de l'utilisateur demandeur
    department = Column(String(100), nullable=False)  # Service demandeur
    
    # Dates de validation
    requested_at = Column(DateTime, default=datetime.utcnow)
    approved_by_dg_at = Column(DateTime)
    approved_by_dg_user_id = Column(Integer, ForeignKey("users.id"))
    dg_signature = Column(Text)  # Signature électronique du DG (base64)
    approved_by_purchase_at = Column(DateTime)
    approved_by_purchase_user_id = Column(Integer, ForeignKey("users.id"))
    rejected_at = Column(DateTime)
    rejected_by_user_id = Column(Integer, ForeignKey("users.id"))
    rejection_reason = Column(Text)
    
    # Informations de commande
    order_number = Column(String(50), unique=True, index=True)  # Numéro de commande
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    supplier = relationship("Supplier", backref="purchase_requests")
    
    # Informations de réception
    received_at = Column(DateTime)  # Date de réception
    received_by = Column(String(100))  # Nom et prénom de la personne qui a reçu
    received_by_user_id = Column(Integer, ForeignKey("users.id"))  # ID de l'utilisateur qui a reçu
    receipt_signature = Column(Text)  # Signature électronique (base64)
    receipt_notes = Column(Text)  # Notes de réception
    
    # Relations avec les utilisateurs
    requested_by_user = relationship("User", foreign_keys=[requested_by_user_id], backref="requested_purchases")
    approved_by_dg_user = relationship("User", foreign_keys=[approved_by_dg_user_id], backref="approved_dg_purchases")
    approved_by_purchase_user = relationship("User", foreign_keys=[approved_by_purchase_user_id], backref="approved_purchase_orders")
    rejected_by_user = relationship("User", foreign_keys=[rejected_by_user_id], backref="rejected_purchases")
    received_by_user = relationship("User", foreign_keys=[received_by_user_id], backref="received_purchases")
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Modèle pour les services
class Service(Base):
    __tablename__ = "services"
    
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, nullable=False, index=True)  # Code automatique
    name = Column(String(100), nullable=False)
    description = Column(Text)
    department_head = Column(String(100))  # Chef de service
    email = Column(String(100))
    phone = Column(String(20))
    location = Column(String(100))  # Localisation du service
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
