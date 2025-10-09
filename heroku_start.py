#!/usr/bin/env python3
"""
Script de démarrage robuste pour Heroku
"""

import os
import sys
import traceback
import uvicorn

def main():
    print("🚀 Démarrage de l'application sur Heroku")
    print("=" * 50)
    
    # Configuration
    host = "0.0.0.0"
    port = int(os.getenv("PORT", 8000))
    
    print(f"🌐 Host: {host}")
    print(f"🔌 Port: {port}")
    print(f"🐍 Python: {sys.version}")
    print(f"📁 Working directory: {os.getcwd()}")
    
    # Vérifier les variables d'environnement critiques
    required_vars = ['SECRET_KEY', 'DATABASE_URL']
    missing_vars = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"⚠️  Variables d'environnement manquantes: {missing_vars}")
        print("   L'application peut ne pas fonctionner correctement")
    
    # Test d'import de l'application
    try:
        print("🔧 Test de chargement de l'application...")
        from main import app
        print("✅ Application chargée avec succès")
    except Exception as e:
        print(f"❌ Erreur lors du chargement de l'application: {e}")
        print("📋 Traceback complet:")
        traceback.print_exc()
        sys.exit(1)
    
    # Démarrage du serveur
    try:
        print(f"🚀 Démarrage du serveur sur {host}:{port}")
        uvicorn.run(
            "main:app",
            host=host,
            port=port,
            log_level="info",
            access_log=True
        )
    except Exception as e:
        print(f"❌ Erreur lors du démarrage du serveur: {e}")
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()

