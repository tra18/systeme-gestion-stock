# ⚙️ Configuration Railway - Guide Étape par Étape

## 🎯 Configuration de votre Projet Railway

### **1. Informations du Projet**
- **Nom** : `generous-vibrancy` (ou changez-le en `systeme-gestion-stock`)
- **Description** : `Système de gestion intégré pour VITACH GUINÉE`
- **Visibilité** : `PRIVATE` (ou `PUBLIC` si vous préférez)

### **2. Variables d'Environnement à Ajouter**

Allez dans l'onglet **"Variables"** et ajoutez :

```
SECRET_KEY=-yC9-CPfZhOre1J-wtjk27pKNVEu-kIf5WpJDW9hEHk
DATABASE_URL=sqlite:///./stock_management.db
DEBUG=False
PORT=8000
PYTHONUNBUFFERED=1
```

### **3. Configuration du Healthcheck**

Dans l'onglet **"Settings"** :
- **Healthcheck Path** : `/health`
- **Healthcheck Timeout** : `600` (10 minutes)
- **OU désactivez complètement le healthcheck**

### **4. Configuration du Déploiement**

Dans l'onglet **"Deploy"** :
- **Start Command** : `python railway_start.py`
- **Build Command** : (laisser vide, Railway détectera automatiquement)

## 🔧 Étapes de Configuration

### **Étape 1 : Variables d'Environnement**
1. Cliquez sur **"Variables"** dans votre projet Railway
2. Ajoutez chaque variable une par une :
   - `SECRET_KEY` = `-yC9-CPfZhOre1J-wtjk27pKNVEu-kIf5WpJDW9hEHk`
   - `DATABASE_URL` = `sqlite:///./stock_management.db`
   - `DEBUG` = `False`
   - `PORT` = `8000`
   - `PYTHONUNBUFFERED` = `1`

### **Étape 2 : Configuration du Healthcheck**
1. Allez dans **"Settings"**
2. Trouvez **"Healthcheck"**
3. **Option A** : Désactivez le healthcheck
4. **Option B** : Configurez :
   - Path : `/health`
   - Timeout : `600`

### **Étape 3 : Redéploiement**
1. Allez dans l'onglet **"Deploy"**
2. Cliquez sur **"Redeploy"** ou **"Deploy"**
3. Attendez que le déploiement se termine

## 🧪 Test de l'Application

Une fois déployé, testez :
- **Page d'accueil** : `https://generous-vibrancy.railway.app/`
- **Healthcheck** : `https://generous-vibrancy.railway.app/health`
- **API** : `https://generous-vibrancy.railway.app/api/docs`

## 🆘 Si le Problème Persiste

### **Solution 1 : Désactiver le Healthcheck**
1. Allez dans **Settings** → **Healthcheck**
2. **Désactivez complètement** le healthcheck
3. Redéployez

### **Solution 2 : Changer le Port**
1. Dans **Variables**, changez `PORT` de `8000` à `8080`
2. Redéployez

### **Solution 3 : Nouveau Déploiement**
1. Supprimez ce projet
2. Créez un nouveau projet
3. Connectez votre repository GitHub
4. Configurez les variables

---

**Suivez ces étapes et votre application devrait fonctionner ! 🚀**

