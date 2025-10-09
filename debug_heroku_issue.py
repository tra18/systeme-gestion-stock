#!/usr/bin/env python3
"""
Script de diagnostic avancé pour identifier les problèmes Heroku
"""

import os
import sys
import traceback

def debug_heroku_issue():
    print("🔍 Diagnostic Avancé - Problème Heroku")
    print("=" * 60)
    
    # Simuler l'environnement Heroku exact
    os.environ['SECRET_KEY'] = '-yC9-CPfZh0re1J-wtjk27pKNVEu-kIf5WpJDW'
    os.environ['DATABASE_URL'] = 'sqlite:///./stock_management.db'
    os.environ['DEBUG'] = 'False'
    os.environ['PYTHONUNBUFFERED'] = '1'
    os.environ['PORT'] = '8000'
    
    print("📋 Environnement simulé :")
    print(f"  Python: {sys.version}")
    print(f"  Working dir: {os.getcwd()}")
    print(f"  Files: {os.listdir('.')[:10]}")
    
    # Test 1: Import des modules de base
    print("\n🔧 Test 1: Modules de base")
    try:
        import fastapi
        print(f"  ✅ FastAPI: {fastapi.__version__}")
    except Exception as e:
        print(f"  ❌ FastAPI: {e}")
    
    try:
        import gunicorn
        print(f"  ✅ Gunicorn: {gunicorn.__version__}")
    except Exception as e:
        print(f"  ❌ Gunicorn: {e}")
    
    # Test 2: Base de données
    print("\n🔧 Test 2: Base de données")
    try:
        from database import init_database
        print("  ✅ Module database importé")
        # Test d'initialisation
        init_database()
        print("  ✅ Base de données initialisée")
    except Exception as e:
        print(f"  ❌ Erreur base de données: {e}")
        traceback.print_exc()
    
    # Test 3: Routers
    print("\n🔧 Test 3: Routers")
    routers_to_test = [
        'auth', 'users', 'services', 'pdf_export', 'suppliers',
        'service_providers', 'purchase_requests', 'purchases',
        'stock', 'vehicles', 'reports', 'maintenance', 'stock_movements'
    ]
    
    failed_routers = []
    for router_name in routers_to_test:
        try:
            __import__(f'routers.{router_name}')
            print(f"  ✅ {router_name}")
        except Exception as e:
            print(f"  ❌ {router_name}: {e}")
            failed_routers.append(router_name)
    
    # Test 4: Application principale
    print("\n🔧 Test 4: Application principale")
    try:
        from main import app
        print("  ✅ Application FastAPI chargée")
        
        # Test des routes
        from fastapi.testclient import TestClient
        client = TestClient(app)
        
        # Test route principale
        try:
            response = client.get("/")
            print(f"  ✅ Route /: {response.status_code}")
        except Exception as e:
            print(f"  ❌ Route /: {e}")
        
        # Test route health
        try:
            response = client.get("/health")
            print(f"  ✅ Route /health: {response.status_code}")
        except Exception as e:
            print(f"  ❌ Route /health: {e}")
            
    except Exception as e:
        print(f"  ❌ Erreur application: {e}")
        traceback.print_exc()
    
    # Résumé
    print(f"\n📊 Résumé:")
    if failed_routers:
        print(f"  ❌ Routers échoués: {failed_routers}")
    else:
        print("  ✅ Tous les tests sont passés localement")
        print("  🔍 Le problème est spécifique à l'environnement Heroku")
        print("  📋 Vérifiez les logs Heroku pour plus de détails")

if __name__ == "__main__":
    debug_heroku_issue()
