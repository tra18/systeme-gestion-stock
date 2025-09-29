# 🔥 Configuration Firebase - Guide Rapide

## ⚠️ IMPORTANT : Configuration Requise

Votre application est prête mais vous devez configurer Firebase pour qu'elle fonctionne.

## 🚀 Étapes de Configuration

### 1. Créer un Projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur **"Créer un projet"**
3. Nommez votre projet : `gestion-commandes-maintenance`
4. Activez Google Analytics (optionnel)
5. Cliquez sur **"Créer le projet"**

### 2. Activer les Services

#### Authentication
1. Menu gauche → **"Authentication"**
2. Cliquez sur **"Commencer"**
3. Onglet **"Sign-in method"**
4. Activez **"Email/Password"**
5. Cliquez sur **"Enregistrer"**

#### Firestore Database
1. Menu gauche → **"Firestore Database"**
2. Cliquez sur **"Créer une base de données"**
3. Choisissez **"Commencer en mode test"**
4. Sélectionnez une région (europe-west1)
5. Cliquez sur **"Terminé"**

#### Storage
1. Menu gauche → **"Storage"**
2. Cliquez sur **"Commencer"**
3. Acceptez les règles par défaut
4. Choisissez une région
5. Cliquez sur **"Terminé"**

### 3. Obtenir la Configuration

1. Menu gauche → Icône ⚙️ → **"Paramètres du projet"**
2. Faites défiler vers **"Vos applications"**
3. Cliquez sur l'icône Web `</>`
4. Nommez votre application : `gestion-commandes-maintenance`
5. Cliquez sur **"Enregistrer l'application"**
6. **COPIEZ** la configuration Firebase

### 4. Mettre à Jour le Fichier de Configuration

Remplacez le contenu de `src/firebase/config.js` par votre vraie configuration :

```javascript
const firebaseConfig = {
  apiKey: "votre-vraie-api-key",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet-id",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "votre-sender-id",
  appId: "votre-app-id"
};
```

### 5. Configurer Firebase CLI (Optionnel)

```bash
# Se connecter à Firebase
firebase login

# Initialiser le projet
firebase use --add

# Déployer les règles de sécurité
firebase deploy --only firestore:rules,storage:rules
```

## 🎯 Test de l'Application

1. **L'application est déjà lancée** sur http://localhost:3000
2. **Créez un compte** avec le rôle "dg" (Directeur Général)
3. **Allez dans Paramètres** → Initialisez la base de données
4. **Testez toutes les fonctionnalités** !

## 🔐 Rôles Disponibles

- **service** : Peut créer des commandes
- **achat** : Peut ajouter des prix et gérer les fournisseurs/prestataires  
- **dg** : Accès complet, peut approuver les commandes et gérer les employés

## 🆘 En Cas de Problème

1. Vérifiez que tous les services Firebase sont activés
2. Vérifiez la configuration dans `src/firebase/config.js`
3. Consultez la console du navigateur pour les erreurs
4. Vérifiez que les règles de sécurité sont déployées

---

**🎉 Une fois configuré, votre application sera 100% fonctionnelle !**
