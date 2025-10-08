# 🚀 Système de Gestion d'Entreprise

Application web complète de gestion d'entreprise avec modules de commandes, maintenance, stock, RH et bien plus.

![React](https://img.shields.io/badge/React-18.2.0-blue)
![Firebase](https://img.shields.io/badge/Firebase-9.9.0-orange)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.1.8-blue)
![Status](https://img.shields.io/badge/Status-Production-success)

## 🌐 Démo en ligne

**URL**: [https://stock-bcbd3.web.app](https://stock-bcbd3.web.app)

## ✨ Fonctionnalités

### 📦 Gestion des Commandes
- Création et suivi des commandes
- Workflow d'approbation (Service → Achat → DG)
- Gestion des prix et fournisseurs
- Historique complet

### 🔧 Gestion de la Maintenance
- Suivi des véhicules
- Planification des maintenances
- Historique des interventions
- Alertes automatiques

### 📊 Gestion du Stock
- Inventaire en temps réel
- Gestion des articles
- Sorties et entrées de stock
- Alertes de stock faible

### 👥 Ressources Humaines (Module complet)
- **Gestion des congés** : Demandes, approbations, workflow
- **Gestion des présences** : Pointage quotidien, statistiques
- **Gestion des salaires** : Paie, primes, déductions
- **Évaluations** : Performance, notes multi-critères
- **Dashboard RH** : Statistiques en temps réel

### 🏢 Gestion Administrative
- Fournisseurs et prestataires
- Services et départements
- Employés
- Alertes et notifications

### 🎯 Fonctionnalités Avancées
- Dashboard avec analytics
- Prédictions IA pour le stock
- Workflows personnalisables
- Mode hors ligne
- Tests automatisés
- Thème clair/sombre

## 🛠️ Technologies Utilisées

### Frontend
- **React** 18.2.0 - Interface utilisateur
- **React Router** 6.3.0 - Navigation
- **TailwindCSS** 3.1.8 - Styling
- **Lucide React** - Icônes
- **Chart.js** - Graphiques

### Backend & Services
- **Firebase Authentication** - Authentification
- **Cloud Firestore** - Base de données
- **Firebase Hosting** - Hébergement
- **Firebase Storage** - Stockage fichiers

### Outils
- **React Hook Form** - Gestion formulaires
- **React Hot Toast** - Notifications
- **jsPDF** - Génération PDF
- **XLSX** - Export Excel

## 📋 Prérequis

- Node.js (v14 ou supérieur)
- npm ou yarn
- Compte Firebase

## 🚀 Installation

### 1. Cloner le projet
```bash
git clone <votre-repo-url>
cd stock
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration Firebase
Créez un fichier `src/firebase/config.js` avec vos identifiants :

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "VOTRE_AUTH_DOMAIN",
  projectId: "VOTRE_PROJECT_ID",
  storageBucket: "VOTRE_STORAGE_BUCKET",
  messagingSenderId: "VOTRE_MESSAGING_SENDER_ID",
  appId: "VOTRE_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
```

### 4. Déployer les règles Firestore
```bash
firebase deploy --only firestore:rules
```

### 5. Lancer en développement
```bash
npm start
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📦 Build et Déploiement

### Build de production
```bash
npm run build
```

### Déploiement sur Firebase
```bash
firebase deploy --only hosting
```

## 👤 Création du Premier Utilisateur

### Option 1 : Via script HTML
Ouvrez `creer-premier-dg.html` dans votre navigateur et créez votre compte DG.

### Option 2 : Via la console
1. Créez un utilisateur dans Firebase Authentication
2. Ajoutez un document dans la collection `users` :
```javascript
{
  email: "votre-email@example.com",
  role: "dg",
  nom: "Votre Nom",
  active: true,
  createdAt: new Date()
}
```

## 🎭 Rôles et Permissions

### 🔑 Directeur Général (DG)
- Accès complet à toutes les fonctionnalités
- Validation finale des commandes
- Gestion des employés et RH
- Accès aux paramètres

### 📦 Service Achat
- Création de commandes
- Ajout des prix
- Gestion des fournisseurs

### 🔧 Service
- Création de commandes
- Gestion de la maintenance
- Suivi du stock

## 📚 Documentation

- **GUIDE_RH.md** - Guide complet du module RH
- **GUIDE_RAPIDE.md** - Guide de démarrage rapide
- **FIREBASE_SETUP.md** - Configuration Firebase

## 🛠️ Scripts Utilitaires

- `creer-premier-dg.html` - Créer le premier utilisateur DG
- `donner-acces-complet.html` - Gérer les rôles utilisateurs
- `init-donnees-rh.html` - Initialiser des données RH de test

## 📱 Responsive Design

L'application est entièrement responsive et fonctionne sur :
- 💻 Desktop
- 📱 Mobile
- 📱 Tablette

## 🔒 Sécurité

- Authentification Firebase
- Règles Firestore sécurisées
- Validation des permissions par rôle
- Protection CSRF
- Sanitisation des données

## 📊 Structure du Projet

```
src/
├── components/
│   ├── ai/              # Composants IA
│   ├── auth/            # Authentification
│   ├── dashboard/       # Tableaux de bord
│   ├── layout/          # Layout (Header, Sidebar)
│   ├── notifications/   # Système de notifications
│   ├── offline/         # Mode hors ligne
│   ├── rh/              # Modules RH
│   ├── testing/         # Tests
│   ├── theme/           # Gestion thème
│   └── workflow/        # Workflows
├── contexts/
│   ├── AuthContext.js   # Contexte authentification
│   └── ThemeContext.js  # Contexte thème
├── firebase/
│   └── config.js        # Configuration Firebase
├── pages/               # Pages de l'application
├── styles/              # Styles globaux
└── utils/               # Utilitaires
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT.

## 👨‍💻 Auteur

Développé avec ❤️ 

## 🙏 Remerciements

- React Team
- Firebase Team
- TailwindCSS Team
- Lucide Icons

## 📞 Support

Pour toute question ou problème :
- 📧 Email: support@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/votre-username/stock/issues)

---

⭐ N'oubliez pas de mettre une étoile si ce projet vous a aidé !
