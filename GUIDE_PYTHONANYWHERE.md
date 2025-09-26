# 🚀 Guide de Déploiement PythonAnywhere

## 📋 **Étapes de Déploiement**

### **1. Créer un Compte PythonAnywhere**

1. **Allez sur [pythonanywhere.com](https://pythonanywhere.com)**
2. **Cliquez sur "Sign up for a free account"**
3. **Créez un compte gratuit**
4. **Aucune carte requise** - Entièrement gratuit !

### **2. Configuration du Projet**

1. **Allez dans l'onglet "Files"**
2. **Créez un nouveau dossier** : `systeme-gestion-stock`
3. **Uploadez tous vos fichiers** depuis GitHub
4. **Ou clonez directement** : `git clone https://github.com/tra18/systeme-gestion-stock.git`

### **3. Configuration de l'Application Web**

1. **Allez dans l'onglet "Web"**
2. **Cliquez sur "Add a new web app"**
3. **Sélectionnez "Manual configuration"**
4. **Choisissez Python 3.11**
5. **Cliquez sur "Next"**

### **4. Configuration du WSGI**

1. **Allez dans l'onglet "Web"**
2. **Cliquez sur "Reload"**
3. **Votre app sera disponible** sur `https://votre-username.pythonanywhere.com`

### **5. Variables d'Environnement**

Dans l'onglet "Files" → "Environment variables", ajoutez :

```
SECRET_KEY=-yC9-CPfZhOre1J-wtjk27pKNVEu-kIf5WpJDW9hEHk
DATABASE_URL=sqlite:///./stock_management.db
DEBUG=False
PYTHONUNBUFFERED=1
```

### **6. Test Final**

Une fois déployé :
- **URL** : `https://votre-username.pythonanywhere.com`
- **Test** : `https://votre-username.pythonanywhere.com/health`
- **Connexion** : `admin` / `admin123`

## 🎯 **Avantages de PythonAnywhere**

- ✅ **Entièrement gratuit** : Aucune carte requise
- ✅ **Python natif** : Gère parfaitement FastAPI
- ✅ **Simple** : Interface web intuitive
- ✅ **HTTPS** : Certificat SSL automatique
- ✅ **Logs** : Logs détaillés en temps réel
- ✅ **Terminal** : Accès terminal pour debug

---

**PythonAnywhere est parfait pour les applications Python ! 🚀**
