# 🚀 Guide de Déploiement Heroku

## 📋 **Étapes de Déploiement**

### **1. Créer un Compte Heroku**

1. **Allez sur [heroku.com](https://heroku.com)**
2. **Cliquez sur "Sign up for free"**
3. **Créez un compte gratuit**

### **2. Installer Heroku CLI (Optionnel)**

Pour faciliter le déploiement :
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Ou téléchargez depuis heroku.com
```

### **3. Créer une Application Heroku**

1. **Allez sur [dashboard.heroku.com](https://dashboard.heroku.com)**
2. **Cliquez sur "New" → "Create new app"**
3. **Nom de l'app** : `systeme-gestion-stock` (ou autre nom disponible)
4. **Région** : United States
5. **Cliquez sur "Create app"**

### **4. Connecter GitHub**

1. **Dans votre app Heroku, allez dans l'onglet "Deploy"**
2. **Sélectionnez "GitHub" comme déploiement method**
3. **Connectez votre compte GitHub**
4. **Sélectionnez le repository** : `tra18/systeme-gestion-stock`
5. **Cliquez sur "Connect"**

### **5. Configuration Automatique**

Heroku va automatiquement détecter :
- ✅ **Framework** : Python (détecté via `requirements.txt`)
- ✅ **Start Command** : `web: python3 railway_simple_start.py` (via `Procfile`)
- ✅ **Python Version** : 3.11.9 (via `runtime.txt`)

### **6. Variables d'Environnement**

Dans l'onglet "Settings" → "Config Vars", ajoutez :

```
SECRET_KEY=-yC9-CPfZhOre1J-wtjk27pKNVEu-kIf5WpJDW9hEHk
DATABASE_URL=sqlite:///./stock_management.db
DEBUG=False
PYTHONUNBUFFERED=1
```

### **7. Déploiement**

1. **Allez dans l'onglet "Deploy"**
2. **Sélectionnez la branche "main"**
3. **Cliquez sur "Deploy Branch"**
4. **Attendez le déploiement** (2-3 minutes)

### **8. Test Final**

Une fois déployé :
- **URL** : `https://votre-app.herokuapp.com`
- **Test** : `https://votre-app.herokuapp.com/health`
- **Connexion** : `admin` / `admin123`

## 🎯 **Avantages de Heroku**

- ✅ **Gratuit** : Plan gratuit généreux
- ✅ **Python natif** : Gère parfaitement FastAPI
- ✅ **Automatique** : Détection automatique du framework
- ✅ **GitHub Integration** : Déploiement automatique à chaque push
- ✅ **HTTPS** : Certificat SSL automatique
- ✅ **Logs** : Logs détaillés en temps réel

## 🔧 **Configuration Automatique**

Heroku va automatiquement :
- Détecter `requirements.txt` pour les dépendances
- Utiliser `Procfile` pour le démarrage
- Utiliser `runtime.txt` pour la version Python
- Gérer les variables d'environnement

---

**Heroku est parfait pour les applications FastAPI ! 🚀**

