# 🚀 Guide de Déploiement Vercel

## 📋 **Étapes de Déploiement**

### **1. Créer un Compte Vercel**

1. **Allez sur [vercel.com](https://vercel.com)**
2. **Cliquez sur "Sign Up"**
3. **Connectez-vous avec GitHub** (plus simple)

### **2. Importer le Projet**

1. **Cliquez sur "New Project"**
2. **Sélectionnez "Import Git Repository"**
3. **Choisissez votre repository** : `tra18/systeme-gestion-stock`
4. **Cliquez sur "Import"**

### **3. Configuration Vercel**

Vercel va automatiquement détecter que c'est un projet Python et utiliser :
- ✅ **Framework** : Python
- ✅ **Build Command** : Automatique
- ✅ **Output Directory** : Automatique
- ✅ **Install Command** : `pip install -r requirements_vercel.txt`

### **4. Variables d'Environnement**

Dans l'onglet "Environment Variables", ajoutez :

```
SECRET_KEY=-yC9-CPfZhOre1J-wtjk27pKNVEu-kIf5WpJDW9hEHk
DATABASE_URL=sqlite:///./stock_management.db
DEBUG=False
PYTHONUNBUFFERED=1
```

### **5. Déploiement**

1. **Cliquez sur "Deploy"**
2. **Attendez le déploiement** (2-3 minutes)
3. **Votre app sera disponible** sur `https://votre-app.vercel.app`

### **6. Test Final**

Une fois déployé :
- **URL** : `https://votre-app.vercel.app`
- **Connexion** : `admin` / `admin123`

## 🎯 **Avantages de Vercel**

- ✅ **Gratuit** : Plan gratuit généreux
- ✅ **Rapide** : Déploiement en 2-3 minutes
- ✅ **Automatique** : Détection automatique du framework
- ✅ **GitHub Integration** : Déploiement automatique à chaque push
- ✅ **HTTPS** : Certificat SSL automatique
- ✅ **CDN** : Distribution mondiale

## 🔧 **Configuration Automatique**

Vercel va automatiquement :
- Détecter `main.py` comme point d'entrée
- Utiliser `requirements_vercel.txt` pour les dépendances
- Configurer le serveur ASGI
- Gérer les routes

---

**Vercel est parfait pour les applications FastAPI ! 🚀**

