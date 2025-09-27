#!/usr/bin/env python3
"""
Script de diagnostic pour GitHub
"""

import subprocess
import sys
import requests
import webbrowser

def run_command(command, description):
    """Exécute une commande et affiche le résultat"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} - Succès")
            if result.stdout.strip():
                print(f"   Output: {result.stdout.strip()}")
            return True, result.stdout
        else:
            print(f"❌ {description} - Erreur")
            if result.stderr.strip():
                print(f"   Erreur: {result.stderr.strip()}")
            return False, result.stderr
    except Exception as e:
        print(f"❌ {description} - Exception: {e}")
        return False, str(e)

def check_repository_urls():
    """Vérifie différentes URLs possibles"""
    urls_to_check = [
        "https://github.com/tra18/systeme-gestion-stock",
        "https://github.com/tra18/systeme-gestion-stock.git",
        "https://api.github.com/repos/tra18/systeme-gestion-stock"
    ]
    
    print("🔍 Vérification des URLs GitHub...")
    for url in urls_to_check:
        try:
            response = requests.get(url, timeout=10)
            print(f"   {url}: {response.status_code}")
            if response.status_code == 200:
                print(f"   ✅ Repository accessible")
                return True
            elif response.status_code == 404:
                print(f"   ❌ Repository non trouvé")
            elif response.status_code == 403:
                print(f"   ⚠️ Repository privé ou accès refusé")
            else:
                print(f"   ⚠️ Statut inattendu: {response.status_code}")
        except Exception as e:
            print(f"   ❌ Erreur: {e}")
    
    return False

def check_git_config():
    """Vérifie la configuration Git"""
    print("🔧 Vérification de la configuration Git...")
    
    # Vérifier l'utilisateur Git
    success, output = run_command("git config user.name", "Nom d'utilisateur Git")
    if success:
        print(f"   Nom: {output.strip()}")
    
    success, output = run_command("git config user.email", "Email Git")
    if success:
        print(f"   Email: {output.strip()}")
    
    # Vérifier les remotes
    success, output = run_command("git remote -v", "Configuration des remotes")
    if success:
        print(f"   Remotes: {output.strip()}")

def suggest_solutions():
    """Suggère des solutions"""
    print("\n" + "="*60)
    print("🔧 SOLUTIONS POSSIBLES")
    print("="*60)
    
    print("\n1. 🐙 **Créer le Repository GitHub**")
    print("   - Allez sur https://github.com")
    print("   - Connectez-vous avec votre compte")
    print("   - Cliquez sur 'New' (bouton vert)")
    print("   - Nom: systeme-gestion-stock")
    print("   - Description: Système de gestion intégré pour VITACH GUINÉE")
    print("   - Public (recommandé)")
    print("   - NE PAS cocher 'Add a README file'")
    print("   - Cliquez 'Create repository'")
    
    print("\n2. 🔗 **Vérifier l'URL du Repository**")
    print("   - Assurez-vous que l'URL est correcte")
    print("   - Vérifiez que le nom d'utilisateur est 'tra18'")
    print("   - Vérifiez que le nom du repository est 'systeme-gestion-stock'")
    
    print("\n3. 🔐 **Vérifier les Permissions**")
    print("   - Assurez-vous d'être connecté à GitHub")
    print("   - Vérifiez que vous avez les permissions d'écriture")
    print("   - Si le repository est privé, assurez-vous d'y avoir accès")
    
    print("\n4. 🔄 **Réessayer le Push**")
    print("   - Une fois le repository créé, exécutez:")
    print("   git push -u origin main")
    
    print("\n5. 🌐 **Ouvrir GitHub dans le Navigateur**")
    print("   - Je vais ouvrir GitHub pour vous")

def open_github():
    """Ouvre GitHub dans le navigateur"""
    print("\n🌐 Ouverture de GitHub...")
    try:
        webbrowser.open("https://github.com/new")
        print("✅ GitHub ouvert dans votre navigateur")
        print("📋 Créez un nouveau repository avec le nom: systeme-gestion-stock")
    except Exception as e:
        print(f"❌ Erreur lors de l'ouverture: {e}")
        print("📋 Allez manuellement sur: https://github.com/new")

def main():
    """Fonction principale"""
    print("🔍 Diagnostic GitHub - Système de Gestion de Stock")
    print("="*60)
    
    # Vérifier la configuration Git
    check_git_config()
    
    # Vérifier les URLs
    repository_exists = check_repository_urls()
    
    if not repository_exists:
        print("\n❌ Le repository GitHub n'existe pas ou n'est pas accessible")
        suggest_solutions()
        open_github()
    else:
        print("\n✅ Repository trouvé ! Essayons de pousser le code...")
        success, output = run_command("git push -u origin main", "Push vers GitHub")
        if success:
            print("\n🎉 Code poussé avec succès !")
            print("📋 Votre repository est maintenant visible sur GitHub")
        else:
            print("\n❌ Erreur lors du push")
            suggest_solutions()

if __name__ == "__main__":
    main()

