# 🏢 Système de Gestion des Commandes et Maintenance

Une application web moderne développée avec React et Firebase pour la gestion des commandes, du stock, de la maintenance des véhicules et des employés.

## 🚀 Fonctionnalités Principales

### 📋 Gestion des Commandes
- **Workflow complet** : Service → Achat → Validation DG
- **Commandes groupées** : Plusieurs articles par commande
- **Signature digitale** : Validation par le Directeur Général
- **Suivi en temps réel** : Statuts et notifications

### 📦 Gestion du Stock
- **Inventaire complet** : Articles, quantités, prix
- **Alertes de stock bas** : Notifications automatiques
- **Sorties de stock** : Traçabilité avec signatures
- **Prix en GNF** : Devise locale

### 🚗 Maintenance des Véhicules
- **Planning des entretiens** : Dates et prestataires
- **Alertes de maintenance** : Rappels automatiques
- **Historique complet** : Suivi des interventions

### 👥 Gestion des Employés
- **Par service** : Organisation hiérarchique
- **Rôles et permissions** : Service, Achat, DG
- **Authentification sécurisée** : Firebase Auth

## 🛠️ Technologies Utilisées

- **Frontend** : React 18, Tailwind CSS
- **Backend** : Firebase (Firestore, Auth, Storage, Hosting)
- **Icons** : Lucide React
- **Notifications** : React Hot Toast
- **Signature** : React Signature Canvas

## 📱 Interface Responsive

- **Mobile** : Navigation hamburger, modales adaptatives
- **Tablette** : Layout optimisé, grilles 2 colonnes
- **Desktop** : Interface complète, sidebar fixe

## 🔐 Système de Rôles

### Service
- Créer des commandes
- Consulter le stock
- Gérer les employés du service

### Achat
- Ajouter les prix aux commandes
- Gérer les fournisseurs
- Consulter les commandes

### Directeur Général (DG)
- Valider les commandes avec signature
- Accès complet à toutes les fonctionnalités
- Gestion des services et employés

## 🚀 Déploiement

L'application est déployée sur Firebase Hosting :
- **URL** : https://stock-bcbd3.web.app
- **Configuration** : Firebase configuré et sécurisé
- **Règles Firestore** : Sécurité par rôles

## 📊 Fonctionnalités Avancées

### 🔔 Système d'Alertes
- **Clignotement** : Icône d'alerte animée
- **Compteur** : Nombre d'alertes en temps réel
- **Types d'alertes** : Commandes en attente, maintenance, stock bas

### 🎨 Interface Moderne
- **Logo personnalisé** : Design professionnel avec cadre
- **Animations** : Transitions fluides et effets visuels
- **Thème cohérent** : Couleurs et typographie harmonieuses

### 📈 Tableau de Bord
- **Statistiques** : Commandes, stock, maintenance
- **Graphiques** : Visualisation des données
- **Alertes** : Notifications importantes

## 🔧 Installation Locale

```bash
# Cloner le projet
git clone https://github.com/votre-username/gestion-commandes.git
cd gestion-commandes

# Installer les dépendances
npm install

# Configurer Firebase
# Copier firebase-config-example.js vers src/firebase/config.js
# Ajouter vos clés Firebase

# Démarrer le serveur de développement
npm start
```

## 📁 Structure du Projet

```
src/
├── components/          # Composants réutilisables
│   ├── auth/           # Authentification
│   └── layout/         # Layout et navigation
├── pages/              # Pages principales
├── contexts/           # Contextes React
├── firebase/           # Configuration Firebase
├── styles/             # Styles CSS personnalisés
└── utils/              # Utilitaires
```

## 🔒 Sécurité

- **Authentification** : Firebase Auth avec rôles
- **Règles Firestore** : Sécurité par rôles et collections
- **Validation** : Côté client et serveur
- **Signatures** : Validation DG avec signature digitale

## 📝 Documentation

- **Guide rapide** : `GUIDE_RAPIDE.md`
- **Configuration Firebase** : `FIREBASE_SETUP.md`
- **Tests** : Fichiers HTML de test inclus

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -m 'Ajouter nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

Développé avec ❤️ pour la gestion moderne des entreprises.

---

**Application déployée et fonctionnelle** : https://stock-bcbd3.web.app