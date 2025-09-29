# 🚀 Guide Rapide - Créer des Données de Test

## 📋 Problème : Tableau Vide

Si vous voyez le workflow mais que le tableau des commandes est vide, c'est normal ! Il faut d'abord créer des données de test.

## 🎯 Solution Rapide

### Option 1 : Script Console (Recommandé)

1. **Ouvrez votre application** dans le navigateur (http://localhost:3000)
2. **Ouvrez la console** (F12 → Console)
3. **Copiez et collez** le contenu du fichier `create-data-console.js`
4. **Appuyez sur Entrée** pour exécuter
5. **Rechargez la page** (F5)

### Option 2 : Fichiers HTML

1. **Ouvrez** `create-sample-commandes.html` dans votre navigateur
2. **Cliquez** sur "Créer un Workflow Complet"
3. **Rechargez** votre application

## 🎨 Ce que vous verrez après

### Page Commandes
- ✅ **4 commandes** avec différents statuts
- ✅ **Workflow visuel** en haut de page
- ✅ **Actions disponibles** selon votre rôle
- ✅ **Statuts colorés** avec icônes

### Statuts des Commandes
- 🔵 **En attente de prix** (Service doit créer)
- 🟡 **En attente d'approbation** (Achat a ajouté le prix)
- 🟢 **Approuvé** (DG a validé)
- 🔴 **Rejeté** (DG a rejeté)

## 🔄 Tester le Workflow

### Si vous êtes Service :
1. Cliquez sur **"Nouvelle commande"**
2. Remplissez le formulaire
3. La commande apparaît en **bleu** (en attente de prix)

### Si vous êtes Achat :
1. Trouvez une commande **bleue**
2. Cliquez sur **"Ajouter Prix"**
3. Ajoutez un prix
4. La commande devient **jaune** (en attente d'approbation)

### Si vous êtes DG :
1. Trouvez une commande **jaune**
2. Cliquez sur **"Valider"**
3. Ajoutez votre signature
4. Cliquez sur **"Approuver"** ou **"Rejeter"**
5. La commande devient **verte** ou **rouge**

## 🚨 Si ça ne marche pas

1. **Vérifiez la console** (F12) pour les erreurs
2. **Rechargez** la page après avoir créé les données
3. **Vérifiez** que vous êtes connecté
4. **Vérifiez** que Firebase est configuré

## 🎉 Résultat Attendu

Après avoir créé les données, vous devriez voir :
- ✅ Un tableau avec 4 commandes
- ✅ Des statuts colorés différents
- ✅ Des boutons d'action selon votre rôle
- ✅ Le workflow visuel en haut de page

**Le workflow sera alors parfaitement visible et testable !** 🚀
