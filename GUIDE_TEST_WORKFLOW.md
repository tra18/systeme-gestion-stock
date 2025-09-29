# 🚀 Guide de Test du Workflow

## 📋 Étapes pour Tester le Workflow Complet

### 1. **Créer des Données d'Exemple**

Avant de tester le workflow, vous devez créer des données d'exemple :

#### A. Commandes d'Exemple
1. Ouvrez le fichier `create-sample-commandes.html` dans votre navigateur
2. Cliquez sur **"Créer un Workflow Complet"**
3. Cela créera des commandes à tous les stades du workflow

#### B. Véhicules et Maintenance
1. Ouvrez le fichier `create-sample-vehicules.html` dans votre navigateur
2. Cliquez sur **"Créer des Véhicules"**
3. Cliquez sur **"Créer des Prestataires"**
4. Cliquez sur **"Créer des Maintenances"**

#### C. Articles de Stock
1. Ouvrez le fichier `create-sample-stock.html` dans votre navigateur
2. Cliquez sur **"Créer des Articles de Stock"**
3. Cliquez sur **"Créer des Alertes de Stock"**

### 2. **Tester le Workflow des Commandes**

#### 🔵 Étape 1 : Service (Création de commande)
1. Connectez-vous avec un utilisateur ayant le rôle **"service"**
2. Allez sur la page **"Commandes"**
3. Cliquez sur **"Nouvelle commande"**
4. Remplissez le formulaire et sauvegardez
5. La commande apparaît avec le statut **"En attente de prix"** (bleu)

#### 🟡 Étape 2 : Achat (Ajout du prix)
1. Connectez-vous avec un utilisateur ayant le rôle **"achat"**
2. Allez sur la page **"Commandes"**
3. Trouvez une commande avec le statut **"En attente de prix"**
4. Cliquez sur le bouton **"Ajouter Prix"** (jaune)
5. Ajoutez un prix et sauvegardez
6. La commande passe au statut **"En attente d'approbation"** (jaune)

#### 🟣 Étape 3 : DG (Validation avec signature)
1. Connectez-vous avec un utilisateur ayant le rôle **"dg"**
2. Allez sur la page **"Commandes"**
3. Trouvez une commande avec le statut **"En attente d'approbation"**
4. Cliquez sur le bouton **"Valider"** (violet)
5. Ajoutez votre signature et un commentaire optionnel
6. Cliquez sur **"Approuver"** ou **"Rejeter"**
7. La commande passe au statut **"Approuvé"** (vert) ou **"Rejeté"** (rouge)

### 3. **Tester la Gestion des Véhicules**

1. Allez sur la page **"Maintenance"**
2. Cliquez sur **"Gérer les véhicules"**
3. Testez :
   - **Créer** un nouveau véhicule
   - **Modifier** un véhicule existant
   - **Supprimer** un véhicule

### 4. **Tester la Gestion de Maintenance**

1. Allez sur la page **"Maintenance"**
2. Cliquez sur **"Nouvelle maintenance"**
3. Sélectionnez un véhicule et un prestataire
4. Remplissez les détails et sauvegardez
5. Vérifiez que la maintenance apparaît dans le tableau

### 5. **Tester la Gestion du Stock**

1. Allez sur la page **"Stock"**
2. Vérifiez les **alertes de stock** en haut de page
3. Cliquez sur **"Nouvel article"** pour créer un article
4. Testez la modification d'articles existants

### 6. **Tester le Tableau de Bord**

1. Allez sur la page **"Tableau de bord"**
2. Vérifiez que vous voyez :
   - **Alertes de stock faible/rupture**
   - **Maintenances en retard/proches**
   - **Statistiques des commandes**

## 🎯 Points de Test Importants

### Workflow des Commandes
- ✅ **Service** peut créer des commandes
- ✅ **Achat** peut ajouter des prix
- ✅ **DG** peut approuver/rejeter avec signature
- ✅ Les statuts changent correctement
- ✅ Les actions sont visibles selon le rôle

### Gestion des Véhicules
- ✅ Création de véhicules
- ✅ Modification des informations
- ✅ Suppression (soft delete)
- ✅ Association avec les maintenances

### Alertes et Notifications
- ✅ Alertes de stock faible/rupture
- ✅ Alertes de maintenance en retard
- ✅ Affichage sur le tableau de bord

## 🔧 Rôles et Permissions

| Rôle | Commandes | Maintenance | Stock | Véhicules | Fournisseurs | Prestataires | Employés |
|------|-----------|-------------|-------|-----------|--------------|--------------|----------|
| **Service** | Créer, Voir | Voir | Voir | Voir | - | - | - |
| **Achat** | Ajouter prix, Voir | Voir | Créer, Modifier | Voir | Gérer | Gérer | - |
| **DG** | Valider, Voir | Voir | Créer, Modifier | Voir | Gérer | Gérer | Gérer |

## 🚨 Résolution de Problèmes

### Si vous ne voyez pas les pages :
1. Vérifiez que votre utilisateur a le bon rôle
2. Utilisez le script `change-role.js` pour changer de rôle
3. Rechargez la page après changement de rôle

### Si les données ne s'affichent pas :
1. Vérifiez que les scripts de création de données ont fonctionné
2. Vérifiez la console du navigateur pour les erreurs
3. Assurez-vous que Firebase est correctement configuré

### Si les actions ne fonctionnent pas :
1. Vérifiez que vous êtes connecté
2. Vérifiez que votre rôle permet l'action
3. Vérifiez les permissions Firebase

## 🎉 Résultat Attendu

Après avoir suivi ce guide, vous devriez avoir :
- ✅ Un workflow de commandes entièrement fonctionnel
- ✅ Une gestion complète des véhicules et maintenances
- ✅ Un système d'alertes de stock opérationnel
- ✅ Une interface intuitive avec des actions claires selon les rôles

**Le workflow est maintenant visible et testable !** 🚀
