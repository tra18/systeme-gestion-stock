# 🏢 VITACH GUINÉE - Système de Gestion Intégré

<div align="center">
  <img src="public/images/vitach-logo-compact.svg" alt="VITACH GUINÉE Logo" width="200" height="200">
  
  <h3>🚀 Système de Gestion Complet pour Entreprise</h3>
  
  [![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org/)
  [![Firebase](https://img.shields.io/badge/Firebase-10.0-orange.svg)](https://firebase.google.com/)
  [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.0-teal.svg)](https://tailwindcss.com/)
  [![PWA](https://img.shields.io/badge/PWA-Ready-green.svg)](https://web.dev/progressive-web-apps/)
  [![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
</div>

## 📋 Table des Matières

- [🎯 Vue d'ensemble](#-vue-densemble)
- [✨ Fonctionnalités](#-fonctionnalités)
- [🛠️ Technologies](#️-technologies)
- [🚀 Installation](#-installation)
- [📱 PWA (Progressive Web App)](#-pwa-progressive-web-app)
- [🏗️ Architecture](#️-architecture)
- [📊 Modules](#-modules)
- [🔐 Sécurité](#-sécurité)
- [📈 Métriques](#-métriques)
- [🤝 Contribution](#-contribution)

## 🎯 Vue d'ensemble

**VITACH GUINÉE** est un système de gestion intégré complet développé avec React et Firebase, offrant une solution tout-en-un pour la gestion d'entreprise moderne. Le système inclut des fonctionnalités avancées de PWA, de gestion IT, de codes-barres, et de ressources humaines.

### 🌟 Points forts

- 📱 **PWA complète** - Installation sur mobile et desktop
- 🔄 **Temps réel** - Synchronisation instantanée des données
- 📊 **Analytics avancés** - Dashboards et métriques en temps réel
- 🎫 **Gestion IT** - Parc informatique et incidents avec SLA
- 📦 **Stock intelligent** - Codes-barres et QR codes
- 👥 **RH moderne** - Pointage, planning, compétences, évaluations

## ✨ Fonctionnalités

### 📱 **PWA (Progressive Web App)**
- ✅ Installation sur mobile et desktop
- ✅ Fonctionnement hors ligne
- ✅ Notifications push
- ✅ Interface native
- ✅ Service Worker avancé

### 💻 **Gestion IT Complète**
- 🖥️ **Inventaire du parc informatique**
  - Suivi des équipements (PC, serveurs, imprimantes)
  - Maintenance préventive et corrective
  - Assignation aux employés
  - Gestion des garanties

- 🎫 **Gestion des incidents**
  - Système de tickets avec numérotation automatique
  - SLA configurable (4h critique, 8h haute, 24h moyenne, 72h basse)
  - Métriques de performance en temps réel
  - Classification par impact et urgence

### 📦 **Gestion de Stock Avancée**
- 📊 **Codes-barres et QR codes**
  - Génération automatique de codes
  - Scanner intégré
  - Impression des étiquettes
  - Traçabilité complète

- 📈 **Analytics de stock**
  - Alertes de stock bas
  - Historique des mouvements
  - Rapports PDF professionnels
  - Statistiques en temps réel

### 👥 **Ressources Humaines Modernes**
- ⏰ **Pointage QR universel**
  - Codes QR individuels par employé
  - Signature électronique
  - Géolocalisation optionnelle
  - Pointage d'arrivée et départ

- 📅 **Planning des équipes**
  - Calendrier hebdomadaire
  - Gestion des congés et formations
  - Assignation des tâches
  - Suivi des présences

- 🎓 **Gestion des compétences**
  - Évaluation par étoiles (1-5)
  - Catégorisation des compétences
  - Suivi des certifications
  - Historique des formations

- 🔄 **Évaluations 360°**
  - Évaluation multi-directionnelle
  - Feedback constructif
  - Suivi des performances
  - Rapports d'évolution

### 📊 **Dashboards Intelligents**
- 📈 **Vue d'ensemble**
  - KPIs en temps réel
  - Graphiques interactifs
  - Alertes automatiques
  - Métriques de performance

- 🎯 **Tableaux de bord spécialisés**
  - Dashboard RH avec présences
  - Dashboard IT avec incidents
  - Dashboard Stock avec mouvements
  - Dashboard Financier avec budgets

## 🛠️ Technologies

### **Frontend**
- ⚛️ **React 18** - Framework JavaScript moderne
- 🎨 **TailwindCSS** - Framework CSS utilitaire
- 📱 **PWA** - Progressive Web App
- 🔄 **React Router** - Navigation SPA
- 📊 **Recharts** - Graphiques et visualisations

### **Backend & Services**
- 🔥 **Firebase** - Backend as a Service
  - **Firestore** - Base de données NoSQL
  - **Authentication** - Gestion des utilisateurs
  - **Storage** - Stockage de fichiers
  - **Hosting** - Déploiement web

### **Outils & Bibliothèques**
- 📄 **jsPDF** - Génération de PDF
- 🔍 **html5-qrcode** - Scanner QR codes
- 📊 **jsbarcode** - Génération de codes-barres
- ✍️ **react-signature-canvas** - Signatures électroniques
- 🔔 **react-hot-toast** - Notifications
- 📅 **date-fns** - Manipulation des dates

## 🚀 Installation

### **Prérequis**
- Node.js 16+ 
- npm ou yarn
- Compte Firebase

### **1. Cloner le projet**
```bash
git clone https://github.com/tra18/systeme-gestion-stock.git
cd systeme-gestion-stock
```

### **2. Installer les dépendances**
```bash
npm install
```

### **3. Configuration Firebase**
1. Créer un projet Firebase
2. Configurer Firestore, Authentication, et Storage
3. Copier les clés de configuration dans `src/firebase/config.js`

### **4. Lancer en développement**
```bash
npm start
```

### **5. Build de production**
```bash
npm run build
```

## 📱 PWA (Progressive Web App)

Le système est entièrement configuré comme PWA :

### **Installation**
- 📱 **Mobile** : Ajouter à l'écran d'accueil via le navigateur
- 💻 **Desktop** : Installer via la barre d'adresse du navigateur
- 🔔 **Notifications** : Activer les notifications push

### **Fonctionnalités hors ligne**
- 📊 Consultation des données mises en cache
- ✏️ Création de contenu (synchronisation automatique)
- 🔄 Synchronisation lors du retour en ligne
- 📱 Interface native sur mobile

## 🏗️ Architecture

```
src/
├── components/          # Composants réutilisables
│   ├── auth/           # Authentification
│   ├── dashboard/      # Tableaux de bord
│   ├── it/             # Gestion IT
│   ├── pwa/            # PWA et notifications
│   ├── rh/             # Ressources humaines
│   ├── stock/          # Gestion de stock
│   └── layout/         # Layout et navigation
├── pages/              # Pages principales
├── contexts/           # Contextes React
├── utils/              # Utilitaires
└── firebase/           # Configuration Firebase

public/
├── manifest.json       # Configuration PWA
├── sw.js              # Service Worker
├── offline.html       # Page hors ligne
└── images/            # Assets et logos
```

## 📊 Modules

### **1. Dashboard Principal**
- Vue d'ensemble des KPIs
- Graphiques en temps réel
- Alertes et notifications

### **2. Gestion des Commandes**
- Création et suivi des commandes
- Gestion des clients
- Facturation et devis

### **3. Maintenance**
- Planification des maintenances
- Suivi des véhicules
- Historique des interventions

### **4. Ressources Humaines**
- Gestion des employés
- Pointage QR universel
- Planning et compétences
- Évaluations 360°

### **5. Gestion de Stock**
- Inventaire complet
- Codes-barres et QR codes
- Mouvements et alertes
- Rapports PDF

### **6. Gestion IT**
- Parc informatique
- Incidents et tickets
- SLA et métriques
- Maintenance préventive

### **7. Rapports et Analytics**
- Rapports personnalisés
- Export PDF professionnel
- Métriques de performance
- Tableaux de bord spécialisés

## 🔐 Sécurité

### **Authentification**
- 🔐 Firebase Authentication
- 👤 Gestion des rôles (DG, RH, IT, Stock)
- 🔑 Permissions granulaires
- 🛡️ Protection des routes

### **Sécurité des données**
- 🔒 Règles Firestore strictes
- 📝 Audit trail complet
- 🚫 Validation côté client et serveur
- 🔐 Chiffrement des données sensibles

## 📈 Métriques

### **Performance**
- ⚡ Temps de chargement < 3s
- 📱 Score Lighthouse > 90
- 🔄 Synchronisation temps réel
- 💾 Cache intelligent

### **Fonctionnalités**
- 📊 15+ types de rapports
- 🎫 Gestion complète des incidents IT
- 📦 Traçabilité stock 100%
- 👥 RH avec 360° évaluations

## 🤝 Contribution

### **Comment contribuer**
1. 🍴 Fork le projet
2. 🌟 Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. 💾 Commit vos changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. 📤 Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. 🔄 Ouvrir une Pull Request

### **Standards de code**
- 📝 Utiliser des commits conventionnels
- 🧪 Tester les nouvelles fonctionnalités
- 📖 Documenter le code
- 🎨 Respecter le design system

## 📞 Support

- 📧 **Email** : support@vitach-guinee.com
- 📱 **Téléphone** : +224 XXX XXX XXX
- 🌐 **Site web** : https://vitach-guinee.com
- 📚 **Documentation** : [Wiki du projet](wiki/)

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

<div align="center">
  <p>Développé avec ❤️ par l'équipe VITACH GUINÉE</p>
  <p>© 2024 VITACH GUINÉE - Tous droits réservés</p>
</div>