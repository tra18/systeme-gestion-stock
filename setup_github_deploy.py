#!/usr/bin/env python3
"""
Script pour configurer GitHub et préparer le déploiement
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

def check_git_status():
    """Vérifie le statut Git"""
    print("📋 Vérification du statut Git...")
    result = subprocess.run(['git', 'status', '--porcelain'], capture_output=True, text=True)
    
    if result.returncode != 0:
        print("❌ Erreur Git. Assurez-vous d'être dans un repository Git.")
        return False
    
    if result.stdout.strip():
        print("📝 Fichiers modifiés détectés:")
        lines = result.stdout.strip().split('\n')
        for line in lines[:10]:  # Afficher seulement les 10 premiers
            print(f"   {line}")
        if len(lines) > 10:
            print(f"   ... et {len(lines) - 10} autres fichiers")
        return True
    else:
        print("✅ Aucun fichier modifié")
        return True

def add_and_commit():
    """Ajoute et commit tous les fichiers"""
    commands = [
        ("git add .", "Ajout de tous les fichiers"),
        ("git commit -m 'Deploy: Système de gestion de stock prêt pour production'", "Commit des changements")
    ]
    
    for command, description in commands:
        if not run_command(command, description):
            return False
    return True

def show_github_instructions():
    """Affiche les instructions pour GitHub"""
    print("\n" + "="*60)
    print("🐙 INSTRUCTIONS POUR GITHUB")
    print("="*60)
    print("\n1. 🌐 Allez sur https://github.com")
    print("2. 🔑 Connectez-vous à votre compte")
    print("3. ➕ Cliquez sur 'New' pour créer un nouveau repository")
    print("4. 📝 Remplissez les informations :")
    print("   - Repository name: systeme-gestion-stock")
    print("   - Description: Système de gestion intégré pour VITACH GUINÉE")
    print("   - Visibilité: Public ou Private")
    print("   - NE PAS cocher 'Add a README file'")
    print("   - NE PAS cocher 'Add .gitignore'")
    print("5. ✅ Cliquez sur 'Create repository'")
    print("\n6. 🔗 Une fois créé, copiez l'URL du repository")
    print("   (elle ressemble à: https://github.com/VOTRE_USERNAME/systeme-gestion-stock.git)")
    print("\n7. 📋 Exécutez ces commandes dans votre terminal :")
    print("   git remote add origin https://github.com/VOTRE_USERNAME/systeme-gestion-stock.git")
    print("   git push -u origin main")
    print("\n8. 🚀 Allez sur https://railway.app pour déployer")

def show_railway_instructions():
    """Affiche les instructions pour Railway"""
    print("\n" + "="*60)
    print("🚀 INSTRUCTIONS POUR RAILWAY")
    print("="*60)
    print("\n1. 🌐 Allez sur https://railway.app")
    print("2. 🔑 Créez un compte (gratuit)")
    print("3. ➕ Cliquez sur 'New Project'")
    print("4. 🔗 Sélectionnez 'Deploy from GitHub repo'")
    print("5. 🔐 Autorisez Railway à accéder à votre GitHub")
    print("6. 📁 Sélectionnez votre repository 'systeme-gestion-stock'")
    print("7. ⚙️ Railway détectera automatiquement la configuration")
    print("8. 🎯 Cliquez sur 'Deploy'")
    print("\n9. 🔧 Configurez les variables d'environnement :")
    print("   SECRET_KEY=-yC9-CPfZhOre1J-wtjk27pKNVEu-kIf5WpJDW9hEHk")
    print("   DATABASE_URL=sqlite:///./stock_management.db")
    print("   DEBUG=False")
    print("   PORT=8000")
    print("\n10. 🎉 Votre application sera déployée !")

def main():
    """Fonction principale"""
    print("🐙 Configuration GitHub et Déploiement")
    print("="*50)
    
    # Vérifier le statut Git
    if not check_git_status():
        sys.exit(1)
    
    # Ajouter et commiter les fichiers
    if not add_and_commit():
        print("❌ Erreur lors du commit")
        sys.exit(1)
    
    # Afficher les instructions
    show_github_instructions()
    show_railway_instructions()
    
    print("\n" + "="*60)
    print("🎯 RÉSUMÉ")
    print("="*60)
    print("✅ Fichiers préparés et commités")
    print("✅ Prêt pour GitHub")
    print("✅ Prêt pour Railway")
    print("\n📋 Prochaines étapes :")
    print("1. Créer le repository GitHub")
    print("2. Ajouter l'origine et pousser")
    print("3. Déployer sur Railway")
    print("4. Configurer les variables d'environnement")
    print("\n🚀 Votre système sera bientôt en ligne !")

if __name__ == "__main__":
    main()
