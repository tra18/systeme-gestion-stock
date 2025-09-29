# Application de Gestion des Commandes et Maintenance

Une application web complète pour la gestion des commandes et de la maintenance des véhicules avec un système de workflow et d'alertes intelligentes.

## 🚀 Fonctionnalités

### 📋 Gestion des Commandes
- **Workflow complet** : Service → Achat → Directeur Général
- **Création de commandes** par les services (sans prix)
- **Ajout de prix** par le service achat
- **Validation** par le directeur général avec signature et commentaires
- **Suivi en temps réel** du statut des commandes

### 🚗 Maintenance des Véhicules
- **Planification** des entretiens chez des prestataires
- **Alertes automatiques** pour les entretiens proches
- **Gestion des prestataires** avec évaluation
- **Suivi des coûts** et délais de maintenance

### 👥 Gestion des Utilisateurs
- **Système de rôles** : Service, Achat, Directeur Général
- **Gestion des employés** par service
- **Authentification sécurisée** avec Firebase

### 🏢 Gestion des Partenaires
- **Fournisseurs** avec évaluation et spécialités
- **Prestataires** de maintenance avec délais moyens
- **Informations complètes** (contact, adresse, notes)

### 📊 Tableau de Bord Intelligent
- **Alertes en temps réel** :
  - Stock bas des commandes
  - Entretiens de véhicules proches
  - Commandes en attente depuis trop longtemps
- **Statistiques** et indicateurs clés
- **Notifications** visuelles avec niveaux de priorité

## 🛠️ Technologies Utilisées

- **Frontend** : React 18, Tailwind CSS
- **Backend** : Firebase (Firestore, Authentication, Storage)
- **Icons** : Lucide React
- **Notifications** : React Hot Toast
- **Dates** : date-fns
- **Routing** : React Router DOM

## 📦 Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd gestion-commandes-maintenance
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration Firebase**
   - Créer un projet Firebase
   - Activer Authentication, Firestore et Storage
   - Copier la configuration dans `src/firebase/config.js`
   - Déployer les règles de sécurité :
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only storage:rules
   ```

4. **Lancer l'application**
```bash
npm start
```

## 🔐 Configuration des Rôles

### Service
- Créer des commandes
- Consulter les commandes
- Voir les alertes

### Achat
- Ajouter des prix aux commandes
- Gérer les fournisseurs et prestataires
- Consulter toutes les commandes

### Directeur Général
- Approuver/rejeter les commandes
- Gérer tous les employés
- Accès complet à toutes les fonctionnalités

## 📱 Structure de l'Application

```
src/
├── components/
│   ├── auth/           # Composants d'authentification
│   └── layout/         # Composants de mise en page
├── contexts/           # Contextes React (Auth)
├── firebase/           # Configuration Firebase
├── pages/              # Pages principales
│   ├── Dashboard.js    # Tableau de bord
│   ├── Commandes.js    # Gestion des commandes
│   ├── Maintenance.js  # Gestion de la maintenance
│   ├── Fournisseurs.js # Gestion des fournisseurs
│   ├── Prestataires.js # Gestion des prestataires
│   ├── Employes.js     # Gestion des employés
│   └── Alertes.js      # Centre d'alertes
└── App.js              # Composant principal
```

## 🗄️ Structure de la Base de Données

### Collections Firestore

- **users** : Utilisateurs et employés
- **commandes** : Commandes avec workflow
- **maintenance** : Entretiens des véhicules
- **vehicules** : Parc automobile
- **fournisseurs** : Fournisseurs de produits
- **prestataires** : Prestataires de maintenance

## 🚨 Système d'Alertes

L'application surveille automatiquement :

1. **Stock bas** : Quantité < 10 unités
2. **Entretiens proches** : Dans les 7 prochains jours
3. **Commandes en attente** : Depuis plus de 3 jours

Les alertes sont classées par priorité :
- 🔴 **Critique** : Action immédiate requise
- 🟡 **Moyenne** : Attention nécessaire
- 🔵 **Faible** : Information

## 🔒 Sécurité

- **Authentification** Firebase avec rôles
- **Règles Firestore** sécurisées par rôle
- **Validation** côté client et serveur
- **Protection des routes** selon les permissions

## 📈 Fonctionnalités Avancées

- **Recherche** et filtrage dans toutes les listes
- **Modals** pour création/modification
- **Notifications** en temps réel
- **Interface responsive** pour mobile/desktop
- **Thème moderne** avec Tailwind CSS

## 🚀 Déploiement

1. **Build de production**
```bash
npm run build
```

2. **Déploiement Firebase Hosting**
```bash
firebase deploy --only hosting
```

## 📞 Support

Pour toute question ou problème, consultez la documentation Firebase ou contactez l'équipe de développement.

---

**Développé avec ❤️ pour une gestion optimale des commandes et de la maintenance**
