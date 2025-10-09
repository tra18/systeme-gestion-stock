#!/usr/bin/env python3
"""
Script de démarrage robuste pour Heroku avec gestion d'erreurs
"""

import os
import sys
import traceback

def startup_check():
    print("🚀 Vérification de démarrage Heroku")
    print("=" * 50)
    
    # Vérifier les variables d'environnement
    required_vars = ['SECRET_KEY', 'DATABASE_URL', 'DEBUG', 'PYTHONUNBUFFERED']
    for var in required_vars:
        value = os.getenv(var)
        if value:
            print(f"✅ {var}: {'*' * 10 if var == 'SECRET_KEY' else value}")
        else:
            print(f"❌ {var}: MANQUANT")
            return False
    
    # Test d'import de l'application
    try:
        print("\n🔧 Test d'import de l'application...")
        from main import app
        print("✅ Application importée avec succès")
        
        # Test de la base de données
        print("\n🔧 Test de la base de données...")
        from database import init_database
        init_database()
        print("✅ Base de données initialisée")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors du démarrage: {e}")
        traceback.print_exc()
        return False

if __name__ == "__main__":
    if startup_check():
        print("\n✅ Application prête pour le démarrage!")
        sys.exit(0)
    else:
        print("\n❌ Erreurs détectées lors du démarrage!")
        sys.exit(1)
