#!/usr/bin/env python3
"""
Script pour créer un utilisateur admin via l'API
"""

import requests
import json

def create_admin_user():
    print("👤 Création de l'utilisateur admin via l'API")
    print("=" * 50)
    
    base_url = "https://shrouded-wildwood-38488.herokuapp.com"
    
    # Données de l'utilisateur admin
    admin_data = {
        "username": "admin",
        "email": "admin@example.com",
        "password": "admin123",
        "full_name": "Administrateur",
        "role": "admin",
        "is_active": True,
        "can_manage_users": True,
        "can_access_purchases": True,
        "can_access_stock": True,
        "can_access_vehicles": True,
        "can_access_maintenance": True,
        "can_access_suppliers": True,
        "can_access_service_providers": True,
        "can_access_reports": True
    }
    
    try:
        # Créer l'utilisateur
        print("🔧 Création de l'utilisateur admin...")
        response = requests.post(
            f"{base_url}/api/users/",
            json=admin_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200 or response.status_code == 201:
            print("✅ Utilisateur admin créé avec succès !")
            print("📋 Identifiants de connexion :")
            print("   👤 Utilisateur : admin")
            print("   🔑 Mot de passe : admin123")
            return True
        else:
            print(f"❌ Erreur lors de la création: {response.status_code}")
            print(f"📋 Réponse: {response.text}")
            
            # Si l'utilisateur existe déjà
            if "already exists" in response.text or "duplicate" in response.text:
                print("ℹ️  L'utilisateur admin existe peut-être déjà")
                print("📋 Essayez de vous connecter avec admin / admin123")
                return True
            
            return False
            
    except Exception as e:
        print(f"❌ Erreur lors de la création: {e}")
        return False

def test_login():
    print("\n🔐 Test de connexion")
    print("=" * 30)
    
    base_url = "https://shrouded-wildwood-38488.herokuapp.com"
    
    login_data = {
        "username": "admin",
        "password": "admin123"
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/login",
            data=login_data
        )
        
        if response.status_code == 200:
            print("✅ Connexion réussie !")
            return True
        else:
            print(f"❌ Échec de la connexion: {response.status_code}")
            print(f"📋 Réponse: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Erreur lors du test de connexion: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Configuration de l'utilisateur admin")
    print("=" * 60)
    
    # Essayer de créer l'utilisateur
    user_created = create_admin_user()
    
    if user_created:
        # Tester la connexion
        login_success = test_login()
        
        if login_success:
            print("\n🎉 Configuration terminée avec succès !")
            print("🌐 Vous pouvez maintenant vous connecter à :")
            print("   https://shrouded-wildwood-38488.herokuapp.com")
        else:
            print("\n⚠️  Utilisateur créé mais connexion échouée")
            print("🔍 Vérifiez manuellement la connexion")
    else:
        print("\n❌ Échec de la configuration")
        print("🔍 Vérifiez les logs pour plus de détails")
