#!/bin/bash

echo "🚀 Démarrage de l'application de gestion des commandes et maintenance"
echo "=================================================================="

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez installer Node.js d'abord."
    exit 1
fi

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez installer npm d'abord."
    exit 1
fi

echo "✅ Node.js et npm sont installés"

# Installer les dépendances si node_modules n'existe pas
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Erreur lors de l'installation des dépendances"
        exit 1
    fi
    echo "✅ Dépendances installées avec succès"
else
    echo "✅ Dépendances déjà installées"
fi

# Vérifier la configuration Firebase
if [ ! -f "src/firebase/config.js" ]; then
    echo "⚠️  Fichier de configuration Firebase manquant"
    echo "📝 Veuillez configurer src/firebase/config.js avec vos clés Firebase"
    echo ""
    echo "Exemple de configuration :"
    echo "const firebaseConfig = {"
    echo "  apiKey: \"votre-api-key\","
    echo "  authDomain: \"votre-projet.firebaseapp.com\","
    echo "  projectId: \"votre-projet-id\","
    echo "  storageBucket: \"votre-projet.appspot.com\","
    echo "  messagingSenderId: \"123456789\","
    echo "  appId: \"votre-app-id\""
    echo "};"
    echo ""
    read -p "Appuyez sur Entrée pour continuer quand vous aurez configuré Firebase..."
fi

echo "🔥 Démarrage de l'application..."
echo "🌐 L'application sera disponible sur http://localhost:3000"
echo ""
echo "📋 Instructions :"
echo "1. Configurez Firebase Authentication, Firestore et Storage"
echo "2. Déployez les règles de sécurité :"
echo "   firebase deploy --only firestore:rules,storage:rules"
echo "3. Créez un utilisateur avec le rôle 'dg' pour accéder aux paramètres"
echo "4. Utilisez la page Paramètres pour initialiser la base de données"
echo ""

npm start
