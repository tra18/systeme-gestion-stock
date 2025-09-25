#!/usr/bin/env python3
"""
Script pour vérifier et pousser le code vers GitHub
"""

import subprocess
import sys
import requests
import time

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

def check_repository_exists():
    """Vérifie si le repository existe sur GitHub"""
    print("🔍 Vérification de l'existence du repository...")
    try:
        response = requests.get("https://github.com/tra18/systeme-gestion-stock", timeout=10)
        if response.status_code == 200:
            print("✅ Repository trouvé sur GitHub")
            return True
        elif response.status_code == 404:
            print("❌ Repository non trouvé (404)")
            return False
        else:
            print(f"⚠️ Statut inattendu: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Erreur lors de la vérification: {e}")
        return False

def check_git_status():
    """Vérifie le statut Git local"""
    print("📋 Vérification du statut Git local...")
    result = subprocess.run(['git', 'status', '--porcelain'], capture_output=True, text=True)
    
    if result.returncode != 0:
        print("❌ Erreur Git. Assurez-vous d'être dans un repository Git.")
        return False
    
    if result.stdout.strip():
        print("📝 Fichiers modifiés détectés:")
        lines = result.stdout.strip().split('\n')
        for line in lines[:5]:  # Afficher seulement les 5 premiers
            print(f"   {line}")
        if len(lines) > 5:
            print(f"   ... et {len(lines) - 5} autres fichiers")
        return True
    else:
        print("✅ Aucun fichier modifié")
        return True

def check_remote():
    """Vérifie la configuration remote"""
    print("🔗 Vérification de la configuration remote...")
    result = subprocess.run(['git', 'remote', '-v'], capture_output=True, text=True)
    if 'origin' in result.stdout and 'tra18/systeme-gestion-stock' in result.stdout:
        print("✅ Remote 'origin' correctement configuré")
        print(f"   {result.stdout.strip()}")
        return True
    else:
        print("❌ Remote 'origin' mal configuré")
        print(f"   {result.stdout.strip()}")
        return False

def push_to_github():
    """Pousse le code vers GitHub"""
    commands = [
        ("git add .", "Ajout de tous les fichiers"),
        ("git commit -m 'Deploy: Système de gestion de stock prêt pour production'", "Commit des changements"),
        ("git push -u origin main", "Push vers GitHub")
    ]
    
    for command, description in commands:
        if not run_command(command, description):
            return False
    return True

def main():
    """Fonction principale"""
    print("🚀 Vérification et Push vers GitHub")
    print("=" * 50)
    
    # Vérifier le repository GitHub
    if not check_repository_exists():
        print("\n❌ Le repository GitHub n'existe pas encore.")
        print("\n📋 Instructions :")
        print("1. Allez sur https://github.com")
        print("2. Connectez-vous avec votre compte tra18")
        print("3. Cliquez sur 'New' pour créer un nouveau repository")
        print("4. Nom: systeme-gestion-stock")
        print("5. Description: Système de gestion intégré pour VITACH GUINÉE")
        print("6. Public (recommandé)")
        print("7. NE PAS cocher 'Add a README file'")
        print("8. Cliquez sur 'Create repository'")
        print("\n9. Relancez ce script après avoir créé le repository")
        return False
    
    # Vérifier le statut Git local
    if not check_git_status():
        return False
    
    # Vérifier la configuration remote
    if not check_remote():
        print("\n🔧 Configuration du remote...")
        if not run_command("git remote add origin https://github.com/tra18/systeme-gestion-stock.git", "Ajout de l'origine"):
            return False
    
    # Pousser vers GitHub
    print("\n🚀 Push vers GitHub...")
    if not push_to_github():
        print("\n❌ Erreur lors du push")
        return False
    
    print("\n🎉 Code poussé vers GitHub avec succès !")
    print("\n📋 Prochaines étapes :")
    print("1. Vérifiez votre repository : https://github.com/tra18/systeme-gestion-stock")
    print("2. Allez sur https://railway.app")
    print("3. Créez un nouveau projet")
    print("4. Connectez votre repository GitHub")
    print("5. Déployez votre application")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
