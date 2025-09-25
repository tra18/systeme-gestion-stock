#!/usr/bin/env python3
"""
Script pour initialiser les utilisateurs par défaut
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, init_database
from models import User, PurchaseRequest, Service
from auth import get_password_hash

def create_default_users():
    """Créer les utilisateurs par défaut"""
    # Initialiser la base de données
    init_database()
    
    db = SessionLocal()
    try:
        # Vérifier si des utilisateurs existent déjà
        if db.query(User).count() > 0:
            print("Des utilisateurs existent déjà dans la base de données.")
            return
        
        # Créer les utilisateurs par défaut
        users = [
            User(
                username="admin",
                email="admin@example.com",
                full_name="Administrateur",
                hashed_password=get_password_hash("admin123"),
                role="admin",
                is_active=True,
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
                full_name="Gestionnaire",
                hashed_password=get_password_hash("manager123"),
                role="manager",
                is_active=True,
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
                is_active=True,
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
        
        db.commit()
        print("✅ Utilisateurs par défaut créés avec succès !")
        print("👤 Admin: admin / admin123")
        print("👤 Manager: manager / manager123")
        print("👤 User: user / user123")
        
    except Exception as e:
        print(f"❌ Erreur lors de la création des utilisateurs: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_default_users()
