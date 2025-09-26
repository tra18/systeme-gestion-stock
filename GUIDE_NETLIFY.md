# 🚀 Guide de Déploiement Netlify

## 📋 **Étapes de Déploiement**

### **1. Créer un Compte Netlify**

1. **Allez sur [netlify.com](https://netlify.com)**
2. **Cliquez sur "Sign up"**
3. **Connectez-vous avec GitHub** (plus simple)
4. **Aucune carte requise** - Entièrement gratuit !

### **2. Importer le Projet**

1. **Cliquez sur "New site from Git"**
2. **Sélectionnez "GitHub"**
3. **Choisissez votre repository** : `tra18/systeme-gestion-stock`
4. **Cliquez sur "Deploy site"**

### **3. Configuration Automatique**

Netlify va automatiquement :
- ✅ **Détecter** que c'est un projet Python
- ✅ **Utiliser** `netlify.toml` pour la configuration
- ✅ **Installer** les dépendances via `requirements.txt`
- ✅ **Démarrer** l'application avec `railway_simple_start.py`

### **4. Variables d'Environnement**

Dans l'onglet "Site settings" → "Environment variables", ajoutez :

```
SECRET_KEY=-yC9-CPfZhOre1J-wtjk27pKNVEu-kIf5WpJDW9hEHk
DATABASE_URL=sqlite:///./stock_management.db
DEBUG=False
PYTHONUNBUFFERED=1
```

### **5. Déploiement**

1. **Netlify va automatiquement déployer**
2. **Attendez le déploiement** (2-3 minutes)
3. **Votre app sera disponible** sur `https://votre-app.netlify.app`

### **6. Test Final**

Une fois déployé :
- **URL** : `https://votre-app.netlify.app`
- **Test** : `https://votre-app.netlify.app/health`
- **Connexion** : `admin` / `admin123`

## 🎯 **Avantages de Netlify**

- ✅ **Entièrement gratuit** : Aucune carte requise
- ✅ **Rapide** : Déploiement en 2-3 minutes
- ✅ **Automatique** : Détection automatique du framework
- ✅ **GitHub Integration** : Déploiement automatique à chaque push
- ✅ **HTTPS** : Certificat SSL automatique
- ✅ **CDN** : Distribution mondiale
- ✅ **Logs** : Logs détaillés en temps réel

## 🔧 **Configuration Automatique**

Netlify va automatiquement :
- Détecter `netlify.toml` pour la configuration
- Utiliser `requirements.txt` pour les dépendances
- Utiliser `railway_simple_start.py` pour le démarrage
- Gérer les variables d'environnement

---

**Netlify est parfait et entièrement gratuit ! 🚀**
