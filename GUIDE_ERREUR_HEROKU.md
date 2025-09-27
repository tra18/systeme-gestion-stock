# 🚨 Guide de Résolution des Erreurs Heroku

## **Erreur : "Application error"**

### **1. Voir les Logs via Dashboard Heroku**

1. **Allez sur [dashboard.heroku.com](https://dashboard.heroku.com)**
2. **Sélectionnez votre app**
3. **Onglet "Logs"** (en haut)
4. **Regardez les erreurs récentes** (lignes en rouge)

### **2. Problèmes Courants et Solutions**

#### **Problème 1 : Variables d'environnement manquantes**
```
Error: SECRET_KEY not found
```
**Solution :**
- Settings → Config Vars
- Ajoutez : `SECRET_KEY = -yC9-CPfZhOre1J-wtjk27pKNVEu-kIf5WpJDW9hEHk`

#### **Problème 2 : Erreur de base de données**
```
Error: DATABASE_URL not found
```
**Solution :**
- Settings → Config Vars
- Ajoutez : `DATABASE_URL = sqlite:///./stock_management.db`

#### **Problème 3 : Erreur d'import de module**
```
Error: No module named 'fastapi'
```
**Solution :**
- Vérifiez que `requirements.txt` contient toutes les dépendances
- Redéployez l'application

#### **Problème 4 : Erreur de port**
```
Error: Port binding failed
```
**Solution :**
- Heroku gère automatiquement le PORT
- Vérifiez que votre code utilise `os.getenv("PORT", 8000)`

### **3. Configuration Complète des Variables**

Dans Settings → Config Vars, ajoutez **TOUTES** ces variables :

```
SECRET_KEY = -yC9-CPfZhOre1J-wtjk27pKNVEu-kIf5WpJDW9hEHk
DATABASE_URL = sqlite:///./stock_management.db
DEBUG = False
PYTHONUNBUFFERED = 1
```

### **4. Vérification du Procfile**

Assurez-vous que votre `Procfile` contient :
```
web: python heroku_start.py
```

### **5. Vérification des Requirements**

Votre `requirements.txt` doit contenir :
```
fastapi==0.65.2
uvicorn[standard]==0.13.4
sqlalchemy==1.4.23
pydantic==1.8.2
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.5
python-dateutil==2.8.2
alembic==1.7.7
```

### **6. Redéploiement**

Après avoir corrigé la configuration :
1. **Onglet "Deploy"**
2. **Cliquez sur "Deploy Branch"**
3. **Attendez le redéploiement**

### **7. Test Final**

Une fois redéployé :
- **URL** : `https://votre-app.herokuapp.com`
- **Test** : `https://votre-app.herokuapp.com/health`
- **Connexion** : `admin` / `admin123`

## 🎯 **Actions Immédiates**

1. **Vérifiez les logs** dans le dashboard Heroku
2. **Ajoutez toutes les variables d'environnement**
3. **Redéployez** l'application
4. **Testez** l'application

---

**La plupart des erreurs viennent des variables d'environnement manquantes ! 🔧**
