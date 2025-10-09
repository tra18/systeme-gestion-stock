# 🔧 Solution pour Render - Problème de Compilation

## 🚨 Problème : Pydantic v2 Nécessite Rust

Le problème vient de pydantic v2 qui nécessite Rust pour la compilation. Voici la solution :

### **Solution 1 : Changer le Build Command**

Dans Render, allez dans **Settings** de votre service et changez :

**Build Command actuel :**
```
pip install -r requirements.txt
```

**Build Command à utiliser :**
```
pip install -r requirements_minimal.txt
```

### **Solution 2 : Utiliser des Versions Pré-compilées**

Si la solution 1 ne marche pas, utilisez ce Build Command :

```
pip install --only-binary=all fastapi uvicorn[standard] sqlalchemy pydantic==1.10.12 python-jose[cryptography] passlib[bcrypt] python-multipart reportlab python-dateutil alembic
```

### **Solution 3 : Configuration Alternative**

Si les solutions précédentes ne marchent pas :

1. **Supprimez le service** dans Render
2. **Créez un nouveau service**
3. **Utilisez ces paramètres :**
   - **Build Command** : `pip install --only-binary=all fastapi uvicorn[standard] sqlalchemy pydantic==1.10.12 python-jose[cryptography] passlib[bcrypt] python-multipart reportlab python-dateutil alembic`
   - **Start Command** : `python3 railway_simple_start.py`

## 🎯 **Action Immédiate**

1. **Allez dans votre service Render**
2. **Cliquez sur "Settings"**
3. **Trouvez "Build Command"**
4. **Changez vers :** `pip install -r requirements_minimal.txt`
5. **Cliquez sur "Save Changes"**
6. **Allez dans "Manual Deploy"** et cliquez sur **"Deploy latest commit"**

## 📋 **Variables d'Environnement**

Une fois le build réussi, ajoutez ces variables dans l'onglet "Environment" :

```
SECRET_KEY=-yC9-CPfZhOre1J-wtjk27pKNVEu-kIf5WpJDW9hEHk
DATABASE_URL=sqlite:///./stock_management.db
DEBUG=False
PYTHONUNBUFFERED=1
```

## 🧪 **Test**

Une fois déployé, testez :
- **URL** : `https://votre-app.onrender.com/`
- **Connexion** : `admin` / `admin123`

---

**Cette solution devrait résoudre le problème de compilation ! 🚀**

