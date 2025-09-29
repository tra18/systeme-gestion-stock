#!/bin/bash

echo "🔥 Déploiement des règles de sécurité Firebase"
echo "=============================================="

# Vérifier si Firebase CLI est installé
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI n'est pas installé"
    echo "📦 Installation de Firebase CLI..."
    npm install -g firebase-tools
fi

echo "✅ Firebase CLI installé"

# Se connecter à Firebase
echo "🔐 Connexion à Firebase..."
firebase login

# Initialiser le projet
echo "🚀 Initialisation du projet Firebase..."
firebase use --add

# Déployer les règles
echo "📋 Déploiement des règles de sécurité..."
firebase deploy --only firestore:rules,storage:rules

echo "🎉 Règles de sécurité déployées avec succès !"
echo "✅ Votre application devrait maintenant fonctionner"
