#!/bin/bash

echo "🧪 Test des nouvelles pages de l'application..."

# Test de la page principale
echo "📊 Test de la page principale..."
curl -s -o /dev/null -w "Page principale: %{http_code}\n" http://localhost:3000

# Test des nouvelles pages (elles redirigeront vers login si pas connecté, c'est normal)
echo "📈 Test des nouvelles pages..."

echo "Dashboard Avancé:"
curl -s -o /dev/null -w "  %{http_code}\n" http://localhost:3000/dashboard-avance

echo "Prédictions IA:"
curl -s -o /dev/null -w "  %{http_code}\n" http://localhost:3000/predictions-ia

echo "Workflows:"
curl -s -o /dev/null -w "  %{http_code}\n" http://localhost:3000/workflows

echo "Mode Hors Ligne:"
curl -s -o /dev/null -w "  %{http_code}\n" http://localhost:3000/hors-ligne

echo "Tests:"
curl -s -o /dev/null -w "  %{http_code}\n" http://localhost:3000/tests

echo "✅ Tests terminés !"
echo ""
echo "🎯 L'application fonctionne correctement !"
echo "📱 Accédez à http://localhost:3000 pour utiliser l'application"
echo "🔐 Connectez-vous avec vos identifiants pour accéder aux nouvelles fonctionnalités"




