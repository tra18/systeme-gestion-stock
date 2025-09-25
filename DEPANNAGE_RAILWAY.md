# 🔧 Dépannage Railway - Guide Complet

## 🚨 Problème : Healthcheck Failure

### **Solution 1 : Configuration Simplifiée**

1. **Supprimez l'ancien déploiement** dans Railway
2. **Créez un nouveau projet** Railway
3. **Connectez votre repository GitHub**
4. **Configurez les variables d'environnement** :
   ```
   SECRET_KEY=-yC9-CPfZhOre1J-wtjk27pKNVEu-kIf5WpJDW9hEHk
   DATABASE_URL=sqlite:///./stock_management.db
   DEBUG=False
   PORT=8000
   PYTHONUNBUFFERED=1
   ```
5. **Déployez sans healthcheck**

### **Solution 2 : Désactiver le Healthcheck**

Dans Railway :
1. Allez dans **Settings** de votre projet
2. Trouvez **Healthcheck**
3. **Désactivez le healthcheck** ou changez le path vers `/`
4. **Redéployez**

### **Solution 3 : Utiliser un Port Différent**

Ajoutez cette variable d'environnement dans Railway :
```
PORT=8080
```

## 🔍 Diagnostic des Problèmes

### **Vérifier les Logs Railway :**
1. Allez dans votre projet Railway
2. Cliquez sur **"View logs"**
3. Cherchez les erreurs

### **Problèmes Courants :**

#### **1. Port non défini**
```
Erreur: PORT environment variable not set
```
**Solution :** Ajoutez `PORT=8000` dans les variables d'environnement

#### **2. Base de données inaccessible**
```
Erreur: Database connection failed
```
**Solution :** Vérifiez `DATABASE_URL=sqlite:///./stock_management.db`

#### **3. Dépendances manquantes**
```
Erreur: Module not found
```
**Solution :** Vérifiez que `requirements.txt` est présent

#### **4. Timeout de démarrage**
```
Erreur: Application failed to start within timeout
```
**Solution :** Augmentez le timeout ou simplifiez le démarrage

## 🛠️ Solutions Alternatives

### **Option 1 : Déploiement sans Healthcheck**
```json
{
  "deploy": {
    "startCommand": "python railway_start.py"
  }
}
```

### **Option 2 : Utiliser un autre port**
```bash
# Dans Railway, ajoutez :
PORT=8080
```

### **Option 3 : Déploiement manuel**
1. **Téléchargez le code** depuis GitHub
2. **Déployez manuellement** sur Railway
3. **Configurez les variables** une par une

## 📋 Checklist de Déploiement

### **Avant le Déploiement :**
- [ ] Repository GitHub créé et code poussé
- [ ] Variables d'environnement préparées
- [ ] Fichiers de configuration présents

### **Pendant le Déploiement :**
- [ ] Logs Railway surveillés
- [ ] Erreurs identifiées et corrigées
- [ ] Timeout respecté

### **Après le Déploiement :**
- [ ] Application accessible via URL
- [ ] Healthcheck fonctionne
- [ ] Connexion admin/admin123 fonctionne

## 🆘 Support

### **Si le Problème Persiste :**

1. **Vérifiez les logs Railway** pour les erreurs spécifiques
2. **Testez localement** avec `python railway_start.py`
3. **Vérifiez les variables d'environnement** dans Railway
4. **Consultez la documentation Railway** pour les problèmes connus

### **Commandes de Test Local :**
```bash
# Tester le démarrage
python railway_start.py

# Tester l'application
curl http://localhost:8000/health

# Tester l'authentification
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123"
```

---

**Avec ces solutions, votre application devrait se déployer correctement ! 🚀**
