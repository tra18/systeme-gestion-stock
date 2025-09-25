#!/usr/bin/env python3
"""
Script de démarrage optimisé pour Railway
"""

import os
import sys
import time
import uvicorn
from fastapi import FastAPI

def check_health():
    """Vérifie que l'application est en bonne santé"""
    try:
        import requests
        response = requests.get(f"http://localhost:{os.getenv('PORT', 8000)}/health", timeout=5)
        return response.status_code == 200
    except:
        return False

def main():
    """Fonction principale de démarrage"""
    print("🚀 Démarrage de l'application pour Railway...")
    
    # Configuration
    host = "0.0.0.0"
    port = int(os.getenv("PORT", 8000))
    
    print(f"📍 Configuration: {host}:{port}")
    print(f"🔧 Variables d'environnement:")
    print(f"   - PORT: {os.getenv('PORT', 'Non défini')}")
    print(f"   - SECRET_KEY: {'Défini' if os.getenv('SECRET_KEY') else 'Non défini'}")
    print(f"   - DATABASE_URL: {os.getenv('DATABASE_URL', 'Non défini')}")
    
    try:
        print("🔄 Démarrage du serveur...")
        uvicorn.run(
            "main:app",
            host=host,
            port=port,
            workers=1,
            log_level="info",
            access_log=True
        )
    except Exception as e:
        print(f"❌ Erreur lors du démarrage: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
