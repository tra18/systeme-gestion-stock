#!/usr/bin/env python3
"""
Script pour réinitialiser complètement la base de données
"""
import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Supprimer l'ancienne base de données
if os.path.exists("database.db"):
    os.remove("database.db")
    print("✅ Ancienne base de données supprimée")

# Importer et initialiser
from database import init_database
from models import User
from auth import get_password_hash

print("🔄 Initialisation de la base de données...")
init_database()

# Vérifier que les utilisateurs ont été créés
from database import SessionLocal
db = SessionLocal()
users = db.query(User).all()
print(f"✅ {len(users)} utilisateurs créés:")
for user in users:
    print(f"  - {user.username} ({user.email}) - Rôle: {user.role}")
db.close()

print("🎉 Base de données initialisée avec succès !")
print("🔑 Comptes disponibles:")
print("  - admin / admin123 (Administrateur)")
print("  - manager / manager123 (Gestionnaire)")  
print("  - user / user123 (Utilisateur)")

