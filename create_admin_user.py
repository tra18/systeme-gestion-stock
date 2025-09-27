#!/usr/bin/env python3
"""
Script pour créer un utilisateur admin par défaut
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import init_database, get_db
from models import User
from auth import get_password_hash
from sqlalchemy.orm import Session

def create_admin_user():
    """Créer un utilisateur admin par défaut"""
    try:
        # Initialiser la base de données
        init_database()
        print("✅ Base de données initialisée")
        
        # Obtenir une session de base de données
        db = next(get_db())
        
        # Vérifier si l'utilisateur admin existe déjà
        admin_user = db.query(User).filter(User.username == "admin").first()
        
        if admin_user:
            print("✅ Utilisateur admin existe déjà")
            return
        
        # Créer l'utilisateur admin
        admin_user = User(
            username="admin",
            email="admin@systeme-gestion.com",
            full_name="Administrateur",
            hashed_password=get_password_hash("admin123"),
            is_active=True,
            is_admin=True,
            # Permissions complètes
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
        print("   Nom d'utilisateur: admin")
        print("   Mot de passe: admin123")
        
    except Exception as e:
        print(f"❌ Erreur lors de la création de l'utilisateur admin: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    create_admin_user()
