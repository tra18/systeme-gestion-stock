# 🔧 Solution Vercel - Problème reportlab

## 🚨 Problème : reportlab ne peut pas être compilé sur Vercel

Le problème vient de `reportlab` qui nécessite une compilation C et échoue sur Vercel. Voici les solutions :

### **Solution 1 : Utiliser requirements_vercel_minimal.txt**

Dans Vercel, changez le Build Command vers :

```bash
pip install -r requirements_vercel_minimal.txt
```

### **Solution 2 : Build Command Direct sans reportlab**

Dans Vercel, utilisez ce Build Command complet :

```bash
pip install fastapi==0.65.2 uvicorn==0.13.4 sqlalchemy==1.4.23 pydantic==1.8.2 python-jose[cryptography]==3.3.0 passlib[bcrypt]==1.7.4 python-multipart==0.0.5 python-dateutil==2.8.2 alembic==1.7.7
```

### **Solution 3 : Alternative - Heroku**

Si Vercel continue à poser problème :

1. **Allez sur [heroku.com](https://heroku.com)**
2. **Créez un nouveau app**
3. **Connectez GitHub** : `tra18/systeme-gestion-stock`
4. **Déployez automatiquement**

### **Solution 4 : Alternative - Netlify**

1. **Allez sur [netlify.com](https://netlify.com)**
2. **Connectez GitHub**
3. **Importez votre repository**
4. **Déployez automatiquement**

## 🎯 **Action Immédiate dans Vercel**

1. **Allez dans Settings** de votre projet Vercel
2. **Changez le Build Command vers :**
   ```
   pip install -r requirements_vercel_minimal.txt
   ```
3. **Save Changes**
4. **Redeploy** → **"Deploy latest commit"**

## 📋 **Variables d'Environnement**

```
SECRET_KEY=-yC9-CPfZhOre1J-wtjk27pKNVEu-kIf5WpJDW9hEHk
DATABASE_URL=sqlite:///./stock_management.db
DEBUG=False
PYTHONUNBUFFERED=1
```

## 🧪 **Test**

Une fois déployé :
- **URL** : `https://votre-app.vercel.app`
- **Connexion** : `admin` / `admin123`

---

**Le problème reportlab sera résolu avec ces solutions ! 🚀**

