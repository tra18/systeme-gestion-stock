# ✍️ Guide - Signature Digitale

## 🎯 Fonctionnalité de Signature

L'application dispose maintenant d'une **signature digitale** pour le Directeur Général lors de la validation des commandes.

## 🚀 Comment Utiliser la Signature

### **1. Processus de Validation DG**

1. **Connectez-vous** avec un utilisateur ayant le rôle **"dg"**
2. **Allez** sur la page **"Commandes"**
3. **Trouvez** une commande avec le statut **"En attente d'approbation"** (jaune)
4. **Cliquez** sur le bouton **"Valider"** (violet)
5. **Dans le modal** :
   - Ajoutez un commentaire optionnel
   - **Signez** dans la zone de signature
   - Cliquez sur **"Sauvegarder la signature"**
   - Cliquez sur **"Approuver"** ou **"Rejeter"**

### **2. Interface de Signature**

- ✅ **Zone de dessin** : Signez avec votre souris ou doigt
- ✅ **Bouton "Effacer"** : Efface la signature actuelle
- ✅ **Bouton "Sauvegarder"** : Sauvegarde la signature
- ✅ **Affichage** : La signature apparaît dans le tableau

### **3. Affichage des Signatures**

Dans le tableau des commandes, vous verrez :
- ✅ **Signature visuelle** : Miniature de la signature
- ✅ **"Non signée"** : Pour les commandes sans signature
- ✅ **Colonne dédiée** : "Signature" dans le tableau

## 🎨 Fonctionnalités de la Signature

### **Zone de Signature**
- **Taille** : 500x200 pixels
- **Couleur** : Noir par défaut
- **Fond** : Blanc avec bordure grise
- **Responsive** : S'adapte à l'écran

### **Actions Disponibles**
- **Dessiner** : Cliquez et glissez pour signer
- **Effacer** : Bouton pour effacer complètement
- **Sauvegarder** : Bouton pour valider la signature
- **Annuler** : Bouton pour fermer sans sauvegarder

### **Validation**
- ✅ **Obligatoire** : Impossible d'approuver sans signature
- ✅ **Sauvegarde** : La signature est stockée en base64
- ✅ **Affichage** : Visible dans le tableau des commandes

## 🔧 Test de la Signature

### **Étape 1 : Créer une Commande**
1. Connectez-vous avec un utilisateur **"service"**
2. Créez une nouvelle commande
3. La commande apparaît en statut **"En attente de prix"** (bleu)

### **Étape 2 : Ajouter le Prix**
1. Connectez-vous avec un utilisateur **"achat"**
2. Trouvez la commande bleue
3. Cliquez sur **"Ajouter Prix"**
4. Ajoutez un prix et sauvegardez
5. La commande passe en statut **"En attente d'approbation"** (jaune)

### **Étape 3 : Signature et Validation**
1. Connectez-vous avec un utilisateur **"dg"**
2. Trouvez la commande jaune
3. Cliquez sur **"Valider"**
4. **Signez** dans la zone de signature
5. Cliquez sur **"Sauvegarder la signature"**
6. Cliquez sur **"Approuver"** ou **"Rejeter"**
7. La commande passe en statut **"Approuvé"** (vert) ou **"Rejeté"** (rouge)

## 🎯 Résultat Attendu

Après validation avec signature :
- ✅ **Statut** : Commande approuvée ou rejetée
- ✅ **Signature** : Visible dans le tableau
- ✅ **Commentaire** : Ajouté si fourni
- ✅ **Date** : Horodatage de la validation

## 🚨 Résolution de Problèmes

### **Si la signature ne s'affiche pas :**
1. Vérifiez que vous avez bien cliqué sur "Sauvegarder la signature"
2. Rechargez la page
3. Vérifiez la console pour les erreurs

### **Si la zone de signature ne fonctionne pas :**
1. Vérifiez que vous utilisez un navigateur moderne
2. Testez avec la souris et le clavier
3. Vérifiez que JavaScript est activé

### **Si la validation ne fonctionne pas :**
1. Vérifiez que vous êtes connecté avec le rôle "dg"
2. Vérifiez que la commande est en statut "en_attente_approbation"
3. Vérifiez que vous avez bien signé avant de valider

## 🎉 Avantages de la Signature Digitale

- ✅ **Sécurité** : Signature unique et traçable
- ✅ **Légalité** : Valeur juridique de la signature
- ✅ **Traçabilité** : Historique des validations
- ✅ **Professionnalisme** : Interface moderne et intuitive

**La signature digitale est maintenant opérationnelle !** 🚀
