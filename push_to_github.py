#!/usr/bin/env python3
"""
Script pour pousser le code vers GitHub
"""

import subprocess
import sys
import os

def run_command(command, description):
    """Exécute une commande et affiche le résultat"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} - Succès")
            if result.stdout.strip():
                print(f"   Output: {result.stdout.strip()}")
            return True
        else:
            print(f"❌ {description} - Erreur")
            if result.stderr.strip():
                print(f"   Erreur: {result.stderr.strip()}")
            return False
    except Exception as e:
        print(f"❌ {description} - Exception: {e}")
        return False

def check_remote():
    """Vérifie si l'origine est configurée"""
    result = subprocess.run(['git', 'remote', '-v'], capture_output=True, text=True)
    if 'origin' in result.stdout:
        print("✅ Remote 'origin' configuré")
        print(f"   {result.stdout.strip()}")
        return True
    else:
        print("❌ Remote 'origin' non configuré")
        return False

def main():
    """Fonction principale"""
    print("🚀 Push vers GitHub")
    print("="*30)
    
    # Vérifier si l'origine est configurée
    if not check_remote():
        print("\n❌ Vous devez d'abord configurer l'origine GitHub.")
        print("\n📋 Instructions :")
        print("1. Créez un repository sur GitHub")
        print("2. Exécutez cette commande :")
        print("   git remote add origin https://github.com/VOTRE_USERNAME/systeme-gestion-stock.git")
        print("3. Relancez ce script")
        return False
    
    # Pousser vers GitHub
    commands = [
        ("git push -u origin main", "Push vers GitHub")
    ]
    
    for command, description in commands:
        if not run_command(command, description):
            print("\n❌ Erreur lors du push")
            print("\n🔧 Solutions possibles :")
            print("1. Vérifiez que le repository GitHub existe")
            print("2. Vérifiez l'URL de l'origine : git remote -v")
            print("3. Vérifiez vos permissions GitHub")
            return False
    
    print("\n🎉 Code poussé vers GitHub avec succès !")
    print("\n📋 Prochaines étapes :")
    print("1. Allez sur https://railway.app")
    print("2. Créez un nouveau projet")
    print("3. Connectez votre repository GitHub")
    print("4. Déployez votre application")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

