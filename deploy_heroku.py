#!/usr/bin/env python3
"""
Script de déploiement automatique pour Heroku
"""

import os
import subprocess
import sys

def deploy_to_heroku():
    print("🚀 Déploiement automatique sur Heroku")
    print("=" * 50)
    
    # Vérifier si Heroku CLI est installé
    try:
        result = subprocess.run(['heroku', '--version'], capture_output=True, text=True)
        print(f"✅ Heroku CLI détecté: {result.stdout.strip()}")
    except FileNotFoundError:
        print("❌ Heroku CLI non trouvé. Installez-le d'abord:")
        print("   brew install heroku/brew/heroku")
        return False
    
    # Vérifier si on est dans un repo git
    if not os.path.exists('.git'):
        print("❌ Pas de repository Git. Initialisez d'abord:")
        print("   git init")
        print("   git add .")
        print("   git commit -m 'Initial commit'")
        return False
    
    # Demander le nom de l'app Heroku
    app_name = input("📝 Nom de votre app Heroku (ou appuyez sur Entrée pour auto-détection): ").strip()
    
    if not app_name:
        # Essayer de détecter l'app existante
        try:
            result = subprocess.run(['heroku', 'apps'], capture_output=True, text=True)
            if result.returncode == 0:
                print("📱 Apps Heroku disponibles:")
                print(result.stdout)
                app_name = input("📝 Entrez le nom de l'app: ").strip()
        except:
            pass
    
    if not app_name:
        print("❌ Nom d'app requis")
        return False
    
    # Vérifier si l'app existe
    try:
        result = subprocess.run(['heroku', 'apps:info', '--app', app_name], 
                              capture_output=True, text=True)
        if result.returncode != 0:
            print(f"❌ App '{app_name}' non trouvée")
            return False
        print(f"✅ App '{app_name}' trouvée")
    except:
        print(f"❌ Erreur lors de la vérification de l'app '{app_name}'")
        return False
    
    # Configurer les variables d'environnement
    env_vars = {
        'SECRET_KEY': '-yC9-CPfZhOre1J-wtjk27pKNVEu-kIf5WpJDW9hEHk',
        'DATABASE_URL': 'sqlite:///./stock_management.db',
        'DEBUG': 'False',
        'PYTHONUNBUFFERED': '1'
    }
    
    print("🔧 Configuration des variables d'environnement...")
    for key, value in env_vars.items():
        try:
            subprocess.run(['heroku', 'config:set', f'{key}={value}', '--app', app_name], 
                         check=True)
            print(f"  ✅ {key}")
        except subprocess.CalledProcessError:
            print(f"  ❌ Erreur pour {key}")
    
    # Déployer
    print("🚀 Déploiement en cours...")
    try:
        subprocess.run(['git', 'push', 'heroku', 'main'], check=True)
        print("✅ Déploiement réussi!")
        
        # Ouvrir l'app
        print("🌐 Ouverture de l'application...")
        subprocess.run(['heroku', 'open', '--app', app_name])
        
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur lors du déploiement: {e}")
        return False

if __name__ == "__main__":
    success = deploy_to_heroku()
    if success:
        print("\n🎉 Déploiement terminé avec succès!")
        print("🔗 Votre app est disponible sur: https://votre-app.herokuapp.com")
    else:
        print("\n❌ Déploiement échoué. Vérifiez les erreurs ci-dessus.")
        sys.exit(1)
