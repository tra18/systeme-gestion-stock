# 🔧 Solution httptools - Problème de Compilation

## 🚨 Problème : httptools ne peut pas être compilé

Le problème vient de `httptools` qui nécessite une compilation C et échoue sur Render. Voici les solutions :

### **Solution 1 : Build Command sans httptools**

Dans Render, utilisez ce Build Command :

```bash
pip install fastapi==0.68.2 uvicorn==0.15.0 sqlalchemy==1.4.23 pydantic==1.8.2 python-jose[cryptography]==3.3.0 passlib[bcrypt]==1.7.4 python-multipart==0.0.5 reportlab==3.6.13 python-dateutil==2.8.2 alembic==1.7.7
```

### **Solution 2 : Utiliser requirements_basic.txt**

Changez le Build Command vers :

```bash
pip install -r requirements_basic.txt
```

### **Solution 3 : Build Command avec pré-compilation**

```bash
pip install --upgrade pip && pip install --no-deps fastapi==0.68.2 uvicorn==0.15.0 sqlalchemy==1.4.23 pydantic==1.8.2 python-jose[cryptography]==3.3.0 passlib[bcrypt]==1.7.4 python-multipart==0.0.5 reportlab==3.6.13 python-dateutil==2.8.2 alembic==1.7.7
```

### **Solution 4 : Railway (Recommandé)**

Railway gère mieux les dépendances C :

1. **Allez sur [railway.app](https://railway.app)**
2. **Connectez GitHub** : `tra18/systeme-gestion-stock`
3. **Déployez automatiquement**

## 🎯 **Action Immédiate dans Render**

1. **Allez dans Settings** de votre service Render
2. **Changez le Build Command vers :**
   ```
   pip install -r requirements_basic.txt
   ```
3. **Save Changes**
4. **Manual Deploy** → **"Deploy latest commit"**

## 📋 **Variables d'Environnement**

```
SECRET_KEY=-yC9-CPfZhOre1J-wtjk27pKNVEu-kIf5WpJDW9hEHk
DATABASE_URL=sqlite:///./stock_management.db
DEBUG=False
PYTHONUNBUFFERED=1
```

## 🧪 **Test**

Une fois déployé :
- **URL** : `https://votre-app.onrender.com/`
- **Connexion** : `admin` / `admin123`

---

**Le problème httptools sera résolu avec ces solutions ! 🚀**
