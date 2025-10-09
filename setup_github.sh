#!/bin/bash

# Script pour initialiser le repository Git et le pousser sur GitHub
# Usage: ./setup_github.sh

echo "🚀 Configuration du repository GitHub pour VITACH GUINÉE"
echo "=================================================="

# Vérifier si Git est installé
if ! command -v git &> /dev/null; then
    echo "❌ Git n'est pas installé. Veuillez installer Git d'abord."
    exit 1
fi

# Initialiser le repository Git
echo "📁 Initialisation du repository Git..."
git init

# Ajouter tous les fichiers
echo "📝 Ajout des fichiers au repository..."
git add .

# Premier commit
echo "💾 Premier commit..."
git commit -m "🎉 Initial commit: Système de gestion intégré VITACH GUINÉE

✅ Fonctionnalités implémentées:
- Système d'authentification complet
- Gestion des achats avec calculs automatiques
- Gestion du stock avec seuils et alertes
- Gestion des véhicules avec maintenance
- Gestion des fournisseurs avec pays/villes
- Gestion des services (7 services de test)
- Demandes d'achat avec workflow complet
- Tableau de bord avec statistiques
- Export CSV de toutes les données
- Interface moderne avec logo VITACH GUINÉE

🏗️ Architecture:
- Backend: FastAPI (Python)
- Base de données: SQLite
- Frontend: HTML/CSS/JavaScript
- Authentification: JWT avec rôles
- Serveur: Uvicorn

👥 Utilisateurs par défaut:
- admin/admin123 (Administrateur)
- manager/manager123 (Manager)
- user/user123 (Utilisateur)
- viewer/viewer123 (Visualiseur)

📊 Statut: Production Ready"

echo ""
echo "✅ Repository Git initialisé avec succès !"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Créer un nouveau repository sur GitHub:"
echo "   - Aller sur https://github.com/new"
echo "   - Nom: vitach-guinee"
echo "   - Description: Système de gestion intégré VITACH GUINÉE"
echo "   - Public ou Private selon vos préférences"
echo "   - NE PAS initialiser avec README (déjà créé)"
echo ""
echo "2. Connecter le repository local à GitHub:"
echo "   git remote add origin https://github.com/VOTRE-USERNAME/vitach-guinee.git"
echo ""
echo "3. Pousser le code sur GitHub:"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "🎉 Votre projet sera alors disponible sur GitHub !"
echo ""
echo "📖 Documentation disponible:"
echo "   - README.md: Documentation complète"
echo "   - ETAT_AVANCEMENT.md: État détaillé du projet"
echo "   - INSTRUCTIONS_REDEMARRAGE.md: Guide de redémarrage"


