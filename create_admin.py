#!/usr/bin/env python3
"""
Script pour créer l'utilisateur admin après le démarrage de l'application
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import get_db
from models import User
from auth import get_password_hash
from sqlalchemy.orm import Session

def create_admin_if_not_exists():
    """Créer l'utilisateur admin s'il n'existe pas"""
    try:
        db = next(get_db())
        admin_user = db.query(User).filter(User.username == "admin").first()
        
        if not admin_user:
            print("Création de l'utilisateur admin...")
            admin_user = User(
                username="admin",
                email="admin@systeme-gestion.com",
                full_name="Administrateur",
                hashed_password=get_password_hash("admin123"),
                is_active=True,
                is_admin=True,
                can_manage_users=True,
                can_access_purchases=True,
                can_manage_stock=True,
                can_access_reports=True,
                can_manage_vehicles=True,
                can_manage_maintenance=True,
                can_manage_suppliers=True,
                can_manage_services=True,
                can_export_data=True
            )
            db.add(admin_user)
            db.commit()
            print("✅ Utilisateur admin créé avec succès")
        else:
            print("✅ Utilisateur admin existe déjà")
            
    except Exception as e:
        print(f"❌ Erreur lors de la création de l'utilisateur admin: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_admin_if_not_exists()
