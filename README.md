# 🏢 VITACH GUINÉE - Système de Gestion Intégré

## 📋 Description

Système de gestion complet pour l'entreprise VITACH GUINÉE, incluant la gestion des achats, du stock, des véhicules, des fournisseurs et des services. Application web moderne développée avec FastAPI et une interface utilisateur intuitive.

## ✨ Fonctionnalités

### 🛒 Gestion des Achats
- Création et suivi des achats
- Calcul automatique des totaux
- Intégration avec le stock
- Export CSV des données

### 📦 Gestion du Stock
- Suivi des quantités avec seuils min/max
- Catégorisation des articles
- Mouvements de stock (entrées/sorties)
- Alertes stock bas
- Export CSV

### 🚗 Gestion des Véhicules
- Enregistrement des véhicules
- Suivi des entretiens avec coûts
- Gestion des pannes avec coûts
- Rappels de maintenance
- Export CSV

### 👥 Gestion des Fournisseurs
- Enregistrement complet des fournisseurs
- Sélection dynamique pays/villes
- Export CSV

### 🏢 Gestion des Services
- Création de services avec codes automatiques
- Gestion des prestataires
- Export CSV

### 📋 Demandes d'Achat
- Workflow complet : Service → DG → Achat → Réception
- Signatures électroniques
- Numéros de commande uniques
- Validation par le DG
- Réception avec signature

### 📊 Tableau de Bord
- Statistiques en temps réel
- Graphiques et indicateurs
- Navigation intuitive
- Interface moderne

## 🚀 Installation et Démarrage

### Prérequis
- Python 3.8+
- pip

### Installation
```bash
# Cloner le repository
git clone https://github.com/votre-username/vitach-guinee.git
cd vitach-guinee

# Installer les dépendances
pip install -r requirements.txt

# Démarrer l'application
python main.py
```

### Accès
- **URL :** http://localhost:8000/
- **Connexion :** `admin` / `admin123`

## 👥 Utilisateurs par Défaut

| Utilisateur | Mot de passe | Rôle | Permissions |
|-------------|--------------|------|-------------|
| admin | admin123 | Administrateur | Toutes les permissions |
| manager | manager123 | Manager | Gestion complète |
| user | user123 | Utilisateur | Permissions standard |
| viewer | viewer123 | Visualiseur | Lecture seule |

## 🏗️ Architecture Technique

### Stack Technologique
- **Backend :** FastAPI (Python)
- **Base de données :** SQLite
- **Frontend :** HTML/CSS/JavaScript
- **Authentification :** JWT avec système de rôles
- **Serveur :** Uvicorn

### Structure du Projet
```
vitach-guinee/
├── main.py                 # Application principale FastAPI
├── database.py             # Configuration base de données
├── models.py               # Modèles SQLAlchemy
├── schemas.py              # Schémas Pydantic
├── auth.py                 # Système d'authentification
├── routers/                # Routes API
│   ├── auth.py
│   ├── purchases.py
│   ├── stock.py
│   ├── vehicles.py
│   ├── suppliers.py
│   ├── services.py
│   ├── purchase_requests.py
│   └── ...
├── templates/              # Pages HTML
│   ├── purchase_requests.html
│   ├── services.html
│   ├── stock.html
│   └── ...
├── static/                 # Fichiers statiques
│   └── vitach-logo.svg
├── requirements.txt        # Dépendances Python
├── README.md              # Documentation
└── .gitignore             # Fichiers à ignorer
```

## 📊 Fonctionnalités Détaillées

### 🔐 Authentification et Autorisation
- Système de connexion sécurisé avec JWT
- 4 niveaux d'utilisateurs avec permissions granulaires
- Gestion des sessions utilisateur

### 📈 Rapports et Exports
- Export CSV de toutes les données
- Génération PDF pour bons de réception
- Tableau de bord avec statistiques en temps réel
- Rapports personnalisables

### 🎨 Interface Utilisateur
- Design moderne et professionnel
- Logo VITACH GUINÉE en arrière-plan
- Navigation intuitive par familles de menus
- Messages d'erreur clairs
- Responsive design
- Animations et effets visuels

## 🔧 Configuration

### Variables d'Environnement
```bash
# Base de données
DATABASE_URL=sqlite:///./gestion_stock.db

# JWT
SECRET_KEY=votre-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### Base de Données
La base de données SQLite est créée automatiquement au premier démarrage avec :
- Tables pour tous les modules
- Utilisateurs par défaut
- Services de test

## 📝 Utilisation

### Première Utilisation
1. Se connecter avec `admin` / `admin123`
2. Explorer le tableau de bord
3. Tester la création d'un achat
4. Vérifier l'intégration stock

### Utilisation Quotidienne
1. Se connecter
2. Utiliser le tableau de bord pour vue d'ensemble
3. Gérer les achats et le stock
4. Suivre les véhicules et maintenance
5. Exporter les rapports si nécessaire

## 🛠️ Développement

### Structure des Routes API
- `/api/auth/` - Authentification
- `/api/purchases/` - Gestion des achats
- `/api/stock/` - Gestion du stock
- `/api/vehicles/` - Gestion des véhicules
- `/api/suppliers/` - Gestion des fournisseurs
- `/api/services/` - Gestion des services
- `/api/purchase-requests/` - Demandes d'achat
- `/api/reports/` - Rapports et statistiques

### Ajout de Nouvelles Fonctionnalités
1. Créer le modèle dans `models.py`
2. Créer les schémas dans `schemas.py`
3. Créer les routes dans `routers/`
4. Créer l'interface dans `templates/`
5. Ajouter les routes dans `main.py`

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

Développé pour VITACH GUINÉE - Système de gestion intégré

## 📞 Support

Pour toute question ou problème :
1. Consulter la documentation
2. Vérifier les issues GitHub
3. Contacter l'équipe de développement

---

**Version :** 1.0 Final  
**Statut :** Production Ready  
**Dernière mise à jour :** 25 Septembre 2025