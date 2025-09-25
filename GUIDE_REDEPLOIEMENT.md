# 🔧 Guide de Redéploiement - Correction du Healthcheck

## ✅ Problème Résolu

J'ai corrigé le problème de healthcheck qui causait l'échec du déploiement. Voici ce qui a été modifié :

### 🔧 **Corrections Apportées :**

1. **Procfile mis à jour** : Utilise maintenant un script de démarrage optimisé
2. **Script de démarrage** : `start.py` créé pour Railway
3. **Configuration Railway** : `railway.toml` avec timeout augmenté
4. **Gestion du port** : Amélioration de la détection du port Railway

## 🚀 Redéploiement sur Railway

### **Option 1 : Redéploiement Automatique**
Railway devrait automatiquement redéployer avec les nouvelles corrections. Vérifiez votre dashboard Railway.

### **Option 2 : Redéploiement Manuel**
1. **Allez sur votre dashboard Railway**
2. **Cliquez sur votre projet**
3. **Cliquez sur "Deploy" ou "Redeploy"**
4. **Attendez que le déploiement se termine**

### **Option 3 : Nouveau Déploiement**
Si le redéploiement automatique ne fonctionne pas :
1. **Supprimez l'ancien déploiement** dans Railway
2. **Créez un nouveau projet**
3. **Connectez votre repository GitHub**
4. **Déployez à nouveau**

## ⚙️ Variables d'Environnement

Assurez-vous que ces variables sont configurées dans Railway :

```
SECRET_KEY=-yC9-CPfZhOre1J-wtjk27pKNVEu-kIf5WpJDW9hEHk
DATABASE_URL=sqlite:///./stock_management.db
DEBUG=False
PORT=8000
PYTHONUNBUFFERED=1
```

## 🧪 Test du Déploiement

Une fois redéployé, testez :

1. **Page d'accueil** : `https://votre-app.railway.app/`
2. **Healthcheck** : `https://votre-app.railway.app/health`
3. **API Documentation** : `https://votre-app.railway.app/api/docs`
4. **Connexion** : `admin` / `admin123`

## 🆘 Si le Problème Persiste

### **Vérifiez les Logs Railway :**
1. Allez dans votre projet Railway
2. Cliquez sur "View logs"
3. Cherchez les erreurs

### **Problèmes Courants :**
1. **Port incorrect** : Vérifiez que `PORT` est défini
2. **Dépendances manquantes** : Vérifiez `requirements.txt`
3. **Base de données** : Vérifiez `DATABASE_URL`

### **Solutions :**
1. **Redémarrez le service** dans Railway
2. **Vérifiez les variables d'environnement**
3. **Consultez les logs détaillés**

## 📋 Fichiers Modifiés

- ✅ `Procfile` - Script de démarrage optimisé
- ✅ `start.py` - Nouveau script de démarrage
- ✅ `railway.toml` - Configuration Railway
- ✅ `main.py` - Gestion du port améliorée

## 🎯 Résultat Attendu

Après le redéploiement, vous devriez voir :
- ✅ **Déploiement réussi** (vert)
- ✅ **Healthcheck réussi** (vert)
- ✅ **Application accessible** via l'URL Railway

---

**Votre application devrait maintenant se déployer correctement ! 🚀**
