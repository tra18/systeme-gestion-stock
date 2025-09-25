#!/usr/bin/env python3
"""
Script de déploiement automatique pour Railway (sans interaction)
"""

import os
import subprocess
import sys
import secrets
import json

def generate_secret_key():
    """Génère une clé secrète sécurisée"""
    return secrets.token_urlsafe(32)

def create_railway_config():
    """Crée le fichier de configuration Railway"""
    config = {
        "build": {
            "builder": "NIXPACKS"
        },
        "deploy": {
            "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
            "healthcheckPath": "/health",
            "healthcheckTimeout": 100,
            "restartPolicyType": "ON_FAILURE",
            "restartPolicyMaxRetries": 10
        }
    }
    
    with open('railway.json', 'w') as f:
        json.dump(config, f, indent=2)
    
    print("✅ Fichier railway.json créé")

def create_env_file():
    """Crée un fichier .env avec les variables d'environnement"""
    secret_key = generate_secret_key()
    
    env_content = f"""# Configuration de production
SECRET_KEY={secret_key}
DATABASE_URL=sqlite:///./stock_management.db
DEBUG=False
PORT=8000

# Configuration de l'application
APP_NAME=Système de Gestion de Stock
APP_VERSION=1.0.0

# Configuration de l'email (optionnel)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=
SMTP_PASSWORD=
"""
    
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print("✅ Fichier .env créé avec une clé secrète sécurisée")
    print(f"🔑 Clé secrète générée: {secret_key}")

def main():
    """Fonction principale"""
    print("🚀 Préparation du déploiement Railway")
    print("=" * 50)
    
    # Créer les fichiers de configuration
    create_railway_config()
    create_env_file()
    
    print("\n🎉 Préparation terminée!")
    print("\n📝 Prochaines étapes manuelles:")
    print("1. Allez sur https://railway.app")
    print("2. Créez un nouveau projet")
    print("3. Connectez votre repository GitHub")
    print("4. Railway déploiera automatiquement votre application")
    print("5. Configurez les variables d'environnement dans Railway:")
    print("   - SECRET_KEY: (utilisez la clé générée ci-dessus)")
    print("   - DATABASE_URL: sqlite:///./stock_management.db")
    print("   - DEBUG: False")
    print("   - PORT: 8000")

if __name__ == "__main__":
    main()
