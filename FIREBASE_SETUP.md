# Configuration Firebase

## 🚀 Étapes pour configurer Firebase

### 1. Créer un projet Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Cliquez sur "Créer un projet"
3. Nommez votre projet : `gestion-commandes-maintenance`
4. Activez Google Analytics (optionnel)
5. Créez le projet

### 2. Activer les services nécessaires

#### Authentication
1. Dans le menu de gauche, cliquez sur "Authentication"
2. Cliquez sur "Commencer"
3. Allez dans l'onglet "Sign-in method"
4. Activez "Email/Password"
5. Cliquez sur "Enregistrer"

#### Firestore Database
1. Dans le menu de gauche, cliquez sur "Firestore Database"
2. Cliquez sur "Créer une base de données"
3. Choisissez "Commencer en mode test" (pour le développement)
4. Sélectionnez une région (europe-west1 pour la France)
5. Cliquez sur "Terminé"

#### Storage
1. Dans le menu de gauche, cliquez sur "Storage"
2. Cliquez sur "Commencer"
3. Acceptez les règles par défaut
4. Choisissez une région
5. Cliquez sur "Terminé"

### 3. Obtenir la configuration

1. Dans le menu de gauche, cliquez sur l'icône d'engrenage ⚙️
2. Cliquez sur "Paramètres du projet"
3. Faites défiler vers le bas jusqu'à "Vos applications"
4. Cliquez sur l'icône Web `</>`
5. Nommez votre application : `gestion-commandes-maintenance`
6. Cliquez sur "Enregistrer l'application"
7. Copiez la configuration Firebase

### 4. Mettre à jour le fichier de configuration

Remplacez le contenu de `src/firebase/config.js` par votre configuration :

```javascript
const firebaseConfig = {
  apiKey: "votre-api-key",
  authDomain: "votre-projet.firebaseapp.com",
  projectId: "votre-projet-id",
  storageBucket: "votre-projet.appspot.com",
  messagingSenderId: "votre-sender-id",
  appId: "votre-app-id"
};
```

### 5. Déployer les règles de sécurité

Si vous avez installé Firebase CLI :

```bash
# Installer Firebase CLI (si pas déjà fait)
npm install -g firebase-tools

# Se connecter à Firebase
firebase login

# Initialiser le projet
firebase init

# Déployer les règles
firebase deploy --only firestore:rules,storage:rules
```

### 6. Créer le premier utilisateur

1. Lancez l'application : `npm start`
2. Allez sur la page de connexion
3. Cliquez sur "Créer un compte" (si disponible)
4. Créez un compte avec le rôle "dg" (Directeur Général)

### 7. Initialiser la base de données

1. Connectez-vous avec votre compte DG
2. Allez dans "Paramètres"
3. Cliquez sur "Initialiser avec des données d'exemple"
4. Confirmez l'initialisation

## 🔐 Rôles disponibles

- **service** : Peut créer des commandes
- **achat** : Peut ajouter des prix et gérer les fournisseurs/prestataires
- **dg** : Accès complet, peut approuver les commandes et gérer les employés

## 📝 Notes importantes

- Les règles de sécurité sont configurées pour le développement
- Pour la production, ajustez les règles selon vos besoins
- Sauvegardez vos clés Firebase en sécurité
- Ne commitez jamais vos vraies clés Firebase dans Git

## 🆘 En cas de problème

1. Vérifiez que tous les services Firebase sont activés
2. Vérifiez que les règles de sécurité sont déployées
3. Vérifiez la configuration dans `src/firebase/config.js`
4. Consultez la console du navigateur pour les erreurs
