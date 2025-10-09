from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from models import PurchasePeriod, PurchaseCategory, VehicleStatus, UserRole

# Schémas pour les achats
class PurchaseBase(BaseModel):
    item_name: str = Field(..., description="Nom de l'article acheté")
    description: Optional[str] = Field(None, description="Description détaillée")
    category: PurchaseCategory = Field(..., description="Catégorie de l'achat")
    period: PurchasePeriod = Field(..., description="Période de l'achat")
    amount: float = Field(..., gt=0, description="Montant total")
    quantity: int = Field(1, gt=0, description="Quantité achetée")
    unit_price: float = Field(..., gt=0, description="Prix unitaire")
    total: float = Field(..., description="Total calculé automatiquement")
    supplier: Optional[str] = Field(None, description="Fournisseur")
    purchase_date: datetime = Field(default_factory=datetime.utcnow)

class PurchaseCreate(PurchaseBase):
    pass

class PurchaseUpdate(BaseModel):
    item_name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[PurchaseCategory] = None
    period: Optional[PurchasePeriod] = None
    amount: Optional[float] = Field(None, gt=0)
    quantity: Optional[int] = Field(None, gt=0)
    unit_price: Optional[float] = Field(None, gt=0)
    supplier: Optional[str] = None
    purchase_date: Optional[datetime] = None

class Purchase(PurchaseBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Schémas pour le stock
class StockItemBase(BaseModel):
    name: str = Field(..., description="Nom de l'article")
    description: Optional[str] = Field(None, description="Description")
    category: PurchaseCategory = Field(..., description="Catégorie")
    current_quantity: int = Field(0, ge=0, description="Quantité actuelle")
    min_threshold: int = Field(0, ge=0, description="Seuil minimum")
    max_threshold: int = Field(100, gt=0, description="Seuil maximum")
    unit: str = Field("unit", description="Unité de mesure")
    location: Optional[str] = Field(None, description="Emplacement")

class StockItemCreate(StockItemBase):
    pass

class StockItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[PurchaseCategory] = None
    current_quantity: Optional[int] = Field(None, ge=0)
    min_threshold: Optional[int] = Field(None, ge=0)
    max_threshold: Optional[int] = Field(None, gt=0)
    unit: Optional[str] = None
    location: Optional[str] = None
    is_active: Optional[bool] = None

class StockItem(StockItemBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Schémas pour les mouvements de stock
class StockMovementBase(BaseModel):
    movement_type: str = Field(..., description="Type de mouvement (in, out, adjustment)")
    quantity: int = Field(..., description="Quantité")
    reason: Optional[str] = Field(None, description="Raison du mouvement")
    reference: Optional[str] = Field(None, description="Référence (facture, bon de sortie, etc.)")

class StockMovementCreate(StockMovementBase):
    stock_item_id: int

class StockMovement(StockMovementBase):
    id: int
    stock_item_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Schémas pour les véhicules
class VehicleBase(BaseModel):
    plate_number: str = Field(..., description="Numéro de plaque")
    brand: str = Field(..., description="Marque")
    model: str = Field(..., description="Modèle")
    year: Optional[int] = Field(None, description="Année")
    color: Optional[str] = Field(None, description="Couleur")
    status: VehicleStatus = Field(VehicleStatus.ACTIVE, description="Statut")
    initial_mileage: int = Field(0, ge=0, description="Kilométrage initial")
    current_mileage: int = Field(0, ge=0, description="Kilométrage actuel")
    fuel_type: Optional[str] = Field(None, description="Type de carburant")

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    plate_number: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    color: Optional[str] = None
    status: Optional[VehicleStatus] = None
    current_mileage: Optional[int] = Field(None, ge=0)
    fuel_type: Optional[str] = None

class Vehicle(VehicleBase):
    id: int
    purchase_date: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Schémas pour la maintenance
class MaintenanceRecordBase(BaseModel):
    maintenance_type: str = Field(..., description="Type de maintenance")
    description: Optional[str] = Field(None, description="Description")
    cost: float = Field(0.0, ge=0, description="Coût")
    mileage_at_service: Optional[int] = Field(None, ge=0, description="Kilométrage au moment du service")
    service_date: datetime = Field(..., description="Date du service")
    next_service_due: Optional[datetime] = Field(None, description="Prochain service prévu")
    service_provider: Optional[str] = Field(None, description="Prestataire de service")

class MaintenanceRecordCreate(MaintenanceRecordBase):
    vehicle_id: int

class MaintenanceRecord(MaintenanceRecordBase):
    id: int
    vehicle_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Schémas pour le carburant
class FuelRecordBase(BaseModel):
    fuel_type: str = Field(..., description="Type de carburant")
    quantity: float = Field(..., gt=0, description="Quantité en litres")
    price_per_liter: float = Field(..., gt=0, description="Prix par litre")
    total_cost: float = Field(..., gt=0, description="Coût total")
    mileage_before: Optional[int] = Field(None, ge=0, description="Kilométrage avant")
    mileage_after: Optional[int] = Field(None, ge=0, description="Kilométrage après")
    fuel_station: Optional[str] = Field(None, description="Station service")
    refuel_date: datetime = Field(default_factory=datetime.utcnow, description="Date de ravitaillement")

class FuelRecordCreate(FuelRecordBase):
    vehicle_id: int

class FuelRecord(FuelRecordBase):
    id: int
    vehicle_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Schémas pour les rapports
class PurchaseReport(BaseModel):
    period: str
    total_amount: float
    category_breakdown: dict
    item_count: int

class StockAlert(BaseModel):
    item_id: int
    item_name: str
    current_quantity: int
    min_threshold: int
    status: str  # "low", "critical", "out_of_stock"

class DashboardStats(BaseModel):
    total_purchases: float
    total_vehicles: int
    low_stock_items: int
    upcoming_maintenance: int
    recent_activities: List[dict]

# Schémas pour l'authentification
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    role: UserRole = UserRole.USER
    # Permissions par page
    can_access_purchases: bool = True
    can_access_stock: bool = True
    can_access_vehicles: bool = True
    can_access_maintenance: bool = True
    can_access_suppliers: bool = True
    can_access_service_providers: bool = True
    can_access_reports: bool = True
    can_manage_users: bool = False

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    # Permissions par page
    can_access_purchases: Optional[bool] = None
    can_access_stock: Optional[bool] = None
    can_access_vehicles: Optional[bool] = None
    can_access_maintenance: Optional[bool] = None
    can_access_suppliers: Optional[bool] = None
    can_access_service_providers: Optional[bool] = None
    can_access_reports: Optional[bool] = None
    can_manage_users: Optional[bool] = None

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# Schémas pour les fournisseurs
class SupplierBase(BaseModel):
    name: str = Field(..., description="Nom du fournisseur")
    contact_person: Optional[str] = Field(None, description="Personne de contact")
    email: Optional[EmailStr] = Field(None, description="Email")
    phone: Optional[str] = Field(None, description="Téléphone")
    address: Optional[str] = Field(None, description="Adresse")
    city: Optional[str] = Field(None, description="Ville")
    country: str = Field("Guinée", description="Pays")
    tax_number: Optional[str] = Field(None, description="Numéro fiscal")
    payment_terms: Optional[str] = Field(None, description="Conditions de paiement")
    notes: Optional[str] = Field(None, description="Notes")

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    tax_number: Optional[str] = None
    payment_terms: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None

class Supplier(SupplierBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Schémas pour les entretiens
class MaintenanceRecordBase(BaseModel):
    maintenance_type: str = Field(..., description="Type d'entretien")
    description: Optional[str] = Field(None, description="Description")
    cost: float = Field(0.0, description="Coût de l'entretien")
    mileage_at_service: Optional[int] = Field(None, description="Kilométrage au moment de l'entretien")
    service_date: datetime = Field(..., description="Date de l'entretien")
    next_service_due: Optional[datetime] = Field(None, description="Prochain entretien prévu")
    service_provider: Optional[str] = Field(None, description="Prestataire de service")
    # is_scheduled: bool = Field(False, description="Entretien programmé")

class MaintenanceRecordCreate(MaintenanceRecordBase):
    vehicle_id: int = Field(..., description="ID du véhicule")

class MaintenanceRecordUpdate(BaseModel):
    maintenance_type: Optional[str] = None
    description: Optional[str] = None
    cost: Optional[float] = None
    mileage_at_service: Optional[int] = None
    service_date: Optional[datetime] = None
    next_service_due: Optional[datetime] = None
    service_provider: Optional[str] = None
    # is_scheduled: Optional[bool] = None

class MaintenanceRecord(MaintenanceRecordBase):
    id: int
    vehicle_id: int
    # reminder_sent: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Schémas pour les pannes
class BreakdownBase(BaseModel):
    breakdown_type: str = Field(..., description="Type de panne")
    description: str = Field(..., description="Description de la panne")
    location: Optional[str] = Field(None, description="Lieu de la panne")
    breakdown_date: datetime = Field(..., description="Date de la panne")
    repair_date: Optional[datetime] = Field(None, description="Date de réparation")
    cost: float = Field(0.0, description="Coût de réparation")
    repair_provider: Optional[str] = Field(None, description="Réparateur")
    mileage_at_breakdown: Optional[int] = Field(None, description="Kilométrage au moment de la panne")
    is_repaired: bool = Field(False, description="Panne réparée")
    repair_notes: Optional[str] = Field(None, description="Notes de réparation")

class BreakdownCreate(BreakdownBase):
    vehicle_id: int = Field(..., description="ID du véhicule")

class BreakdownUpdate(BaseModel):
    breakdown_type: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    breakdown_date: Optional[datetime] = None
    repair_date: Optional[datetime] = None
    cost: Optional[float] = None
    repair_provider: Optional[str] = None
    mileage_at_breakdown: Optional[int] = None
    is_repaired: Optional[bool] = None
    repair_notes: Optional[str] = None

class Breakdown(BreakdownBase):
    id: int
    vehicle_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Schémas pour les prestataires de service
class ServiceProviderBase(BaseModel):
    name: str = Field(..., description="Nom du prestataire")
    contact_person: Optional[str] = Field(None, description="Personne de contact")
    email: Optional[EmailStr] = Field(None, description="Email")
    phone: Optional[str] = Field(None, description="Téléphone")
    address: Optional[str] = Field(None, description="Adresse")
    city: Optional[str] = Field(None, description="Ville")
    country: str = Field("Guinée", description="Pays")
    service_type: str = Field(..., description="Type de service")
    specialization: Optional[str] = Field(None, description="Spécialisation")
    rating: float = Field(0.0, ge=0.0, le=5.0, description="Note de 0 à 5")
    is_active: bool = Field(True, description="Prestataire actif")
    notes: Optional[str] = Field(None, description="Notes")

class ServiceProviderCreate(ServiceProviderBase):
    pass

class ServiceProviderUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    service_type: Optional[str] = None
    specialization: Optional[str] = None
    rating: Optional[float] = Field(None, ge=0.0, le=5.0)
    is_active: Optional[bool] = None
    notes: Optional[str] = None

class ServiceProvider(ServiceProviderBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Schémas pour les demandes d'achat avec workflow de validation
class PurchaseRequestBase(BaseModel):
    item_name: str = Field(..., description="Nom de l'article demandé")
    description: Optional[str] = Field(None, description="Description détaillée")
    category: PurchaseCategory = Field(..., description="Catégorie de l'achat")
    quantity: int = Field(..., gt=0, description="Quantité demandée")
    unit: str = Field("pièce", description="Unité de mesure")
    urgency: str = Field("normal", description="Urgence: low, normal, high, urgent")
    justification: str = Field(..., description="Justification de la demande")
    department: str = Field(..., description="Service demandeur")

class PurchaseRequestCreate(PurchaseRequestBase):
    pass

class PurchaseRequestUpdate(BaseModel):
    status: Optional[str] = None
    supplier_id: Optional[int] = None
    order_number: Optional[str] = None
    rejection_reason: Optional[str] = None

class PurchaseRequestApproval(BaseModel):
    action: str = Field(..., description="approve ou reject")
    reason: Optional[str] = Field(None, description="Raison de l'approbation ou du rejet")
    signature: Optional[str] = Field(None, description="Signature électronique du DG (base64)")

class PurchaseRequestReceipt(BaseModel):
    received_by: str = Field(..., description="Nom et prénom de la personne qui a reçu")
    receipt_notes: Optional[str] = Field(None, description="Notes de réception")
    signature: str = Field(..., description="Signature électronique (base64)")

class PurchaseRequest(PurchaseRequestBase):
    id: int
    request_number: str
    status: str
    requested_by: str
    requested_by_user_id: int
    requested_at: datetime
    approved_by_dg_at: Optional[datetime] = None
    approved_by_dg_user_id: Optional[int] = None
    dg_signature: Optional[str] = None
    approved_by_purchase_at: Optional[datetime] = None
    approved_by_purchase_user_id: Optional[int] = None
    rejected_at: Optional[datetime] = None
    rejected_by_user_id: Optional[int] = None
    rejection_reason: Optional[str] = None
    order_number: Optional[str] = None
    supplier_id: Optional[int] = None
    received_at: Optional[datetime] = None
    received_by: Optional[str] = None
    received_by_user_id: Optional[int] = None
    receipt_signature: Optional[str] = None
    receipt_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Schémas pour les services
class ServiceBase(BaseModel):
    name: str = Field(..., description="Nom du service")
    description: Optional[str] = Field(None, description="Description du service")
    department_head: Optional[str] = Field(None, description="Chef de service")
    email: Optional[str] = Field(None, description="Email du service")
    phone: Optional[str] = Field(None, description="Téléphone du service")
    location: Optional[str] = Field(None, description="Localisation du service")

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    department_head: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    is_active: Optional[bool] = None

class Service(ServiceBase):
    id: int
    code: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Schémas pour les mouvements de stock
class StockMovementBase(BaseModel):
    movement_type: str = Field(..., description="Type de mouvement: entry ou exit")
    quantity: int = Field(..., gt=0, description="Quantité du mouvement")
    reason: Optional[str] = Field(None, description="Raison du mouvement")
    reference: Optional[str] = Field(None, description="Référence (numéro d'achat, etc.)")

class StockMovementCreate(StockMovementBase):
    stock_item_id: int = Field(..., description="ID de l'article en stock")

class StockMovementUpdate(BaseModel):
    movement_type: Optional[str] = None
    quantity: Optional[int] = Field(None, gt=0)
    reason: Optional[str] = None
    reference: Optional[str] = None

class StockMovement(StockMovementBase):
    id: int
    stock_item_id: int
    user_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True
