#!/bin/bash

# Script pour configurer les labels GitHub
# Usage: ./setup_github_labels.sh

echo "🏷️ Configuration des labels GitHub pour VITACH GUINÉE"
echo "=================================================="

# Vérifier si gh CLI est installé
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) n'est pas installé."
    echo "📥 Installation de GitHub CLI..."
    
    # Installation pour macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install gh
        else
            echo "❌ Homebrew n'est pas installé. Veuillez installer GitHub CLI manuellement."
            echo "📖 Instructions: https://cli.github.com/manual/installation"
            exit 1
        fi
    else
        echo "❌ Système non supporté. Veuillez installer GitHub CLI manuellement."
        echo "📖 Instructions: https://cli.github.com/manual/installation"
        exit 1
    fi
fi

# Vérifier si l'utilisateur est connecté à GitHub
if ! gh auth status &> /dev/null; then
    echo "🔐 Connexion à GitHub requise..."
    gh auth login
fi

# Vérifier si le repository existe
if ! gh repo view &> /dev/null; then
    echo "❌ Aucun repository GitHub trouvé dans ce dossier."
    echo "📋 Assurez-vous d'être dans le bon dossier et que le repository est connecté à GitHub."
    echo ""
    echo "🔗 Pour connecter votre repository local à GitHub:"
    echo "   git remote add origin https://github.com/VOTRE-USERNAME/vitach-guinee.git"
    exit 1
fi

echo "✅ Repository GitHub trouvé !"

# Créer les labels
echo "🏷️ Création des labels..."

# Labels principaux
gh label create "bug" --color "d73a4a" --description "Quelque chose ne fonctionne pas" --force
gh label create "enhancement" --color "a2eeef" --description "Nouvelle fonctionnalité ou demande" --force
gh label create "documentation" --color "0075ca" --description "Améliorations ou ajouts à la documentation" --force
gh label create "good first issue" --color "7057ff" --description "Bon pour les nouveaux contributeurs" --force
gh label create "help wanted" --color "008672" --description "Aide extra nécessaire" --force

# Labels de priorité
gh label create "priority: high" --color "ff6b6b" --description "Priorité haute" --force
gh label create "priority: medium" --color "ffa726" --description "Priorité moyenne" --force
gh label create "priority: low" --color "66bb6a" --description "Priorité basse" --force

# Labels de statut
gh label create "status: in progress" --color "fbca04" --description "En cours de développement" --force
gh label create "status: needs review" --color "0e8a16" --description "Nécessite une review" --force
gh label create "status: blocked" --color "b60205" --description "Bloqué par autre chose" --force

# Labels de type
gh label create "type: frontend" --color "e99695" --description "Changements frontend" --force
gh label create "type: backend" --color "c2e0c6" --description "Changements backend" --force
gh label create "type: database" --color "d4c5f9" --description "Changements base de données" --force
gh label create "type: api" --color "f9d0c4" --description "Changements API" --force
gh label create "type: ui/ux" --color "fef2c0" --description "Changements interface utilisateur" --force
gh label create "type: security" --color "ff6b6b" --description "Problèmes de sécurité" --force
gh label create "type: performance" --color "00d4aa" --description "Améliorations de performance" --force

# Labels de modules
gh label create "module: auth" --color "1d76db" --description "Module d'authentification" --force
gh label create "module: purchases" --color "1d76db" --description "Module des achats" --force
gh label create "module: stock" --color "1d76db" --description "Module du stock" --force
gh label create "module: vehicles" --color "1d76db" --description "Module des véhicules" --force
gh label create "module: suppliers" --color "1d76db" --description "Module des fournisseurs" --force
gh label create "module: services" --color "1d76db" --description "Module des services" --force
gh label create "module: reports" --color "1d76db" --description "Module des rapports" --force

echo ""
echo "✅ Labels GitHub configurés avec succès !"
echo ""
echo "🏷️ Labels créés:"
echo "   - Labels principaux (bug, enhancement, documentation, etc.)"
echo "   - Labels de priorité (high, medium, low)"
echo "   - Labels de statut (in progress, needs review, blocked)"
echo "   - Labels de type (frontend, backend, database, etc.)"
echo "   - Labels de modules (auth, purchases, stock, etc.)"
echo ""
echo "🎉 Votre repository GitHub est maintenant configuré avec tous les labels !"
