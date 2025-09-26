#!/usr/bin/env python3
"""
Script de diagnostic pour Heroku
"""

import os
import sys
import traceback

def diagnostic():
    print("🔍 Diagnostic Heroku")
    print("=" * 50)
    
    # Vérifier les variables d'environnement
    print("📋 Variables d'environnement :")
    env_vars = [
        'SECRET_KEY', 'DATABASE_URL', 'DEBUG', 'PYTHONUNBUFFERED',
        'PORT', 'DYNO', 'HEROKU_APP_NAME'
    ]
    
    for var in env_vars:
        value = os.getenv(var, 'NON DÉFINIE')
        if var == 'SECRET_KEY' and value != 'NON DÉFINIE':
            value = value[:10] + '...'  # Masquer la clé
        print(f"  {var}: {value}")
    
    print("\n🐍 Python version:")
    print(f"  {sys.version}")
    
    print("\n📁 Working directory:")
    print(f"  {os.getcwd()}")
    
    print("\n📂 Files in directory:")
    try:
        files = os.listdir('.')
        for f in files[:10]:  # Afficher les 10 premiers fichiers
            print(f"  {f}")
    except Exception as e:
        print(f"  Erreur: {e}")
    
    print("\n🔧 Test d'import des modules:")
    try:
        import fastapi
        print(f"  ✅ FastAPI: {fastapi.__version__}")
    except Exception as e:
        print(f"  ❌ FastAPI: {e}")
    
    try:
        import uvicorn
        print(f"  ✅ Uvicorn: {uvicorn.__version__}")
    except Exception as e:
        print(f"  ❌ Uvicorn: {e}")
    
    try:
        import sqlalchemy
        print(f"  ✅ SQLAlchemy: {sqlalchemy.__version__}")
    except Exception as e:
        print(f"  ❌ SQLAlchemy: {e}")
    
    print("\n🚀 Test de démarrage de l'application:")
    try:
        from main import app
        print("  ✅ Application FastAPI chargée avec succès")
    except Exception as e:
        print(f"  ❌ Erreur lors du chargement de l'application: {e}")
        print(f"  📋 Traceback complet:")
        traceback.print_exc()

if __name__ == "__main__":
    diagnostic()
