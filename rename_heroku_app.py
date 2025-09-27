#!/usr/bin/env python3
"""
Script pour renommer l'app Heroku
"""

import subprocess
import sys

def rename_heroku_app():
    print("🔄 Renommage de l'application Heroku")
    print("=" * 50)
    
    current_name = "shrouded-wildwood-38488"
    new_name = input(f"📝 Nouveau nom pour l'app (actuellement: {current_name}): ").strip()
    
    if not new_name:
        print("❌ Nom requis")
        return False
    
    # Vérifier si Heroku CLI est installé
    try:
        result = subprocess.run(['heroku', '--version'], capture_output=True, text=True)
        print(f"✅ Heroku CLI détecté: {result.stdout.strip()}")
    except FileNotFoundError:
        print("❌ Heroku CLI non trouvé. Utilisez le dashboard Heroku à la place.")
        print("🔗 https://dashboard.heroku.com/apps/shrouded-wildwood-38488/settings")
        return False
    
    # Renommer l'app
    try:
        print(f"🔄 Renommage de {current_name} vers {new_name}...")
        subprocess.run(['heroku', 'apps:rename', new_name, '--app', current_name], check=True)
        print(f"✅ App renommée avec succès!")
        print(f"🔗 Nouvelle URL: https://{new_name}.herokuapp.com")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Erreur lors du renommage: {e}")
        return False

if __name__ == "__main__":
    success = rename_heroku_app()
    if success:
        print("\n🎉 Renommage terminé!")
    else:
        print("\n❌ Renommage échoué.")
        sys.exit(1)
