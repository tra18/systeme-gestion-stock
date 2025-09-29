# 🎯 Guide d'Accès aux Pages - Application de Gestion

## 🔍 **Problème Identifié**
Vous avez accès à l'application mais ne voyez pas toutes les pages. C'est normal ! Le système utilise un **système de rôles** qui limite l'accès selon votre profil utilisateur.

## 📋 **Rôles et Permissions**

### 👑 **Directeur Général (dg)** - Accès Complet
- ✅ Tableau de bord
- ✅ Commandes
- ✅ Maintenance
- ✅ Fournisseurs
- ✅ Prestataires
- ✅ Employés
- ✅ Alertes
- ✅ Paramètres

### 🛒 **Service Achat (achat)**
- ✅ Tableau de bord
- ✅ Commandes
- ✅ Maintenance
- ✅ Fournisseurs
- ✅ Prestataires
- ✅ Alertes
- ❌ Employés (non autorisé)
- ❌ Paramètres (non autorisé)

### 👤 **Service (service)** - Rôle par défaut
- ✅ Tableau de bord
- ✅ Commandes
- ✅ Maintenance (consultation)
- ✅ Alertes
- ❌ Fournisseurs (non autorisé)
- ❌ Prestataires (non autorisé)
- ❌ Employés (non autorisé)
- ❌ Paramètres (non autorisé)

## 🚀 **Solutions pour Accéder à Toutes les Pages**

### **Solution 1 : Modifier Votre Rôle (Recommandé)**

1. **Allez dans "Paramètres"** (si visible) ou **connectez-vous avec un compte DG**
2. **Cliquez sur l'icône ✏️** à côté de votre rôle
3. **Sélectionnez "Directeur Général (Accès complet)"**
4. **Cliquez sur "Sauvegarder"**
5. **Rechargez la page** - vous verrez maintenant toutes les pages !

### **Solution 2 : Créer un Compte Administrateur**

Si vous n'avez pas accès aux Paramètres :

1. **Allez sur** [Firebase Console](https://console.firebase.google.com/)
2. **Sélectionnez votre projet** `stock`
3. **Menu "Authentication"** → **"Users"**
4. **Cliquez sur "Add user"**
5. **Créez un utilisateur** avec :
   - Email : `admin@votre-entreprise.com`
   - Mot de passe : `Admin123!`
6. **Retournez dans l'application**
7. **Connectez-vous avec ce nouveau compte**
8. **Allez dans "Paramètres"** → **"Créer un Utilisateur Administrateur"**
9. **Créez un utilisateur avec le rôle DG**

### **Solution 3 : Utiliser la Console Firebase**

1. **Allez sur** [Firebase Console](https://console.firebase.google.com/)
2. **Sélectionnez votre projet** `stock`
3. **Menu "Firestore Database"** → **"Data"**
4. **Collection "users"** → **Votre utilisateur**
5. **Modifiez le champ "role"** → **"dg"**
6. **Sauvegardez**
7. **Rechargez l'application**

## 🔧 **Vérification de Votre Rôle Actuel**

1. **Regardez en bas de la barre latérale** (sidebar)
2. **Vous devriez voir** :
   - Votre nom
   - Votre rôle actuel

## 🎯 **Pages Disponibles Selon le Rôle**

| Page | Service | Achat | DG |
|------|---------|-------|----|
| Tableau de bord | ✅ | ✅ | ✅ |
| Commandes | ✅ | ✅ | ✅ |
| Maintenance | ✅ | ✅ | ✅ |
| Fournisseurs | ❌ | ✅ | ✅ |
| Prestataires | ❌ | ✅ | ✅ |
| Employés | ❌ | ❌ | ✅ |
| Alertes | ✅ | ✅ | ✅ |
| Paramètres | ❌ | ❌ | ✅ |

## 🚨 **Si Vous Ne Voyez Aucune Page**

1. **Vérifiez que vous êtes connecté**
2. **Vérifiez votre rôle** en bas de la sidebar
3. **Rechargez la page** (F5)
4. **Vérifiez la console** pour des erreurs

## 📞 **Support**

Si vous avez encore des problèmes :
1. **Vérifiez la console du navigateur** (F12)
2. **Vérifiez que Firebase est bien configuré**
3. **Vérifiez que les services Firebase sont activés**

---

**🎉 Une fois votre rôle mis à jour vers "Directeur Général", vous aurez accès à toutes les fonctionnalités de votre application !**
