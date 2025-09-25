from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Service
import os

# Configuration de la base de données
DATABASE_URL = "sqlite:///./gestion_stock.db"

# Création du moteur de base de données
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # Nécessaire pour SQLite
)

# Création de la session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_tables():
    """Crée toutes les tables dans la base de données"""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Dépendance pour obtenir une session de base de données"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_database():
    """Initialise la base de données avec des données de test"""
    # Créer les tables seulement si elles n'existent pas
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Vérifier si des données existent déjà
        from models import Vehicle, StockItem, Purchase, User, Supplier, ServiceProvider, PurchaseRequest
        from auth import get_password_hash
        
        # Créer les utilisateurs par défaut seulement s'ils n'existent pas
        existing_admin = db.query(User).filter(User.username == "admin").first()
        if not existing_admin:
            users = [
                User(
                    username="admin",
                    email="admin@example.com",
                    full_name="Administrateur",
                    hashed_password=get_password_hash("admin123"),
                    role="admin",
                    can_access_purchases=True,
                    can_access_stock=True,
                    can_access_vehicles=True,
                    can_access_maintenance=True,
                    can_access_suppliers=True,
                    can_access_service_providers=True,
                    can_access_reports=True,
                    can_manage_users=True
                ),
                User(
                    username="manager",
                    email="manager@example.com",
                    full_name="Manager",
                    hashed_password=get_password_hash("manager123"),
                    role="manager",
                    can_access_purchases=True,
                    can_access_stock=True,
                    can_access_vehicles=True,
                    can_access_maintenance=True,
                    can_access_suppliers=True,
                    can_access_service_providers=True,
                    can_access_reports=True,
                    can_manage_users=False
                ),
                User(
                    username="user",
                    email="user@example.com",
                    full_name="Utilisateur",
                    hashed_password=get_password_hash("user123"),
                    role="user",
                    can_access_purchases=True,
                    can_access_stock=True,
                    can_access_vehicles=True,
                    can_access_maintenance=True,
                    can_access_suppliers=True,
                    can_access_service_providers=True,
                    can_access_reports=True,
                    can_manage_users=False
                )
            ]
            
            for user in users:
                db.add(user)
        
        # Créer les fournisseurs par défaut
        if db.query(Supplier).count() == 0:
            suppliers = [
                Supplier(
                    name="Fournisseur Général",
                    contact_person="M. Diallo",
                    email="contact@fournisseur-gn.com",
                    phone="+224 123 456 789",
                    address="Quartier Almamya",
                    city="Conakry",
                    country="Guinée",
                    payment_terms="30 jours"
                ),
                Supplier(
                    name="Équipements Bureau",
                    contact_person="Mme Camara",
                    email="bureau@equipements.com",
                    phone="+224 987 654 321",
                    address="Centre-ville",
                    city="Conakry",
                    country="Guinée",
                    payment_terms="15 jours"
                ),
                Supplier(
                    name="Station Service Total",
                    contact_person="M. Bah",
                    email="total@station.com",
                    phone="+224 555 123 456",
                    address="Route du Niger",
                    city="Conakry",
                    country="Guinée",
                    payment_terms="Paiement comptant"
                )
            ]
            
            for supplier in suppliers:
                db.add(supplier)
        
        # Créer les prestataires de service par défaut
        if db.query(ServiceProvider).count() == 0:
            service_providers = [
                ServiceProvider(
                    name="Garage Central",
                    contact_person="M. Bah",
                    email="contact@garage-central.com",
                    phone="+224 123 456 789",
                    address="Route de l'Aéroport",
                    city="Conakry",
                    country="Guinée",
                    service_type="Mécanique",
                    specialization="Moteur et transmission",
                    rating=4.5,
                    notes="Garage spécialisé dans les véhicules légers"
                ),
                ServiceProvider(
                    name="Carrosserie Moderne",
                    contact_person="Mme. Diallo",
                    email="info@carrosserie-moderne.com",
                    phone="+224 987 654 321",
                    address="Quartier Almamya",
                    city="Conakry",
                    country="Guinée",
                    service_type="Carrosserie",
                    specialization="Réparation et peinture",
                    rating=4.2,
                    notes="Spécialiste carrosserie et peinture"
                ),
                ServiceProvider(
                    name="Électricité Auto",
                    contact_person="M. Camara",
                    email="elec@electricite-auto.com",
                    phone="+224 555 123 456",
                    address="Zone Industrielle",
                    city="Conakry",
                    country="Guinée",
                    service_type="Électricité",
                    specialization="Diagnostic et réparation",
                    rating=4.0,
                    notes="Diagnostic électronique automobile"
                ),
                ServiceProvider(
                    name="Pneumatique Express",
                    contact_person="M. Traoré",
                    email="contact@pneumatique-express.com",
                    phone="+224 666 789 012",
                    address="Route de Donka",
                    city="Conakry",
                    country="Guinée",
                    service_type="Pneumatique",
                    specialization="Pneus et équilibrage",
                    rating=4.3,
                    notes="Service rapide pneus et équilibrage"
                )
            ]
            for provider in service_providers:
                db.add(provider)
        
        if db.query(Vehicle).count() == 0:
            # Ajouter des véhicules d'exemple
            vehicles = [
                Vehicle(
                    plate_number="ABC-123",
                    brand="Toyota",
                    model="Corolla",
                    year=2020,
                    color="Blanc",
                    fuel_type="Essence",
                    current_mileage=45000
                ),
                Vehicle(
                    plate_number="XYZ-789",
                    brand="Ford",
                    model="Transit",
                    year=2019,
                    color="Bleu",
                    fuel_type="Diesel",
                    current_mileage=78000
                )
            ]
            
            for vehicle in vehicles:
                db.add(vehicle)
            
            # Ajouter des items de stock d'exemple
            stock_items = [
                StockItem(
                    name="Papier A4",
                    description="Rame de papier A4 80g",
                    category="office_supplies",
                    current_quantity=50,
                    min_threshold=10,
                    max_threshold=100,
                    unit="rame",
                    location="Armoire A1"
                ),
                StockItem(
                    name="Cartouches d'encre HP",
                    description="Cartouches d'encre noire HP 305",
                    category="equipment",
                    current_quantity=5,
                    min_threshold=2,
                    max_threshold=20,
                    unit="pièce",
                    location="Bureau principal"
                ),
                StockItem(
                    name="Essence",
                    description="Carburant pour véhicules",
                    category="fuel",
                    current_quantity=200,
                    min_threshold=50,
                    max_threshold=500,
                    unit="litre",
                    location="Station service"
                )
            ]
            
            for item in stock_items:
                db.add(item)
            
            db.commit()
            print("✅ Base de données initialisée avec des données d'exemple")
        
    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation: {e}")
        db.rollback()
    finally:
        db.close()
