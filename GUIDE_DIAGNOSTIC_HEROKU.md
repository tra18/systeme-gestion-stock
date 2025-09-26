# 🔧 Guide de Diagnostic Heroku

## 🚨 **Problème : Application Error**

Si vous voyez "An error occurred in the application", voici comment diagnostiquer :

### **1. Vérifier les Logs Heroku**

**Option A : Via Dashboard Heroku**
1. Allez sur [dashboard.heroku.com](https://dashboard.heroku.com)
2. Sélectionnez votre app
3. Allez dans l'onglet "Logs"
4. Regardez les erreurs récentes

**Option B : Via CLI Heroku**
```bash
heroku logs --tail --app votre-app-name
```

### **2. Variables d'Environnement à Vérifier**

Dans Heroku → Settings → Config Vars, vérifiez :

```
SECRET_KEY=-yC9-CPfZhOre1J-wtjk27pKNVEu-kIf5WpJDW9hEHk
DATABASE_URL=sqlite:///./stock_management.db
DEBUG=False
PYTHONUNBUFFERED=1
```

### **3. Problèmes Courants**

**Problème 1 : Variables d'environnement manquantes**
- Solution : Ajoutez toutes les variables ci-dessus

**Problème 2 : Erreur de base de données**
- Solution : Vérifiez que DATABASE_URL est correct

**Problème 3 : Erreur d'import**
- Solution : Vérifiez que tous les modules sont installés

**Problème 4 : Port incorrect**
- Solution : Heroku gère automatiquement le PORT

### **4. Script de Diagnostic**

J'ai créé `diagnostic_heroku.py` pour diagnostiquer les problèmes :

```bash
# Dans Heroku CLI
heroku run python diagnostic_heroku.py --app votre-app-name
```

### **5. Redéploiement**

Si les variables d'environnement sont correctes :
1. Allez dans l'onglet "Deploy"
2. Cliquez sur "Deploy Branch"
3. Attendez le redéploiement

### **6. Test Final**

Une fois redéployé :
- **URL** : `https://votre-app.herokuapp.com`
- **Test** : `https://votre-app.herokuapp.com/health`
- **Connexion** : `admin` / `admin123`

## 🎯 **Actions Immédiates**

1. **Vérifiez les logs** dans le dashboard Heroku
2. **Vérifiez les variables d'environnement**
3. **Redéployez** si nécessaire
4. **Testez** l'application

---

**Le diagnostic va révéler la cause exacte du problème ! 🔍**
