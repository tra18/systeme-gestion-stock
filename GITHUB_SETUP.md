# 🐙 Configuration GitHub - Système de Gestion de Stock

## 📋 Étapes pour créer et déployer votre projet

### 1. 🆕 Créer un Repository GitHub

1. **Allez sur [github.com](https://github.com)**
2. **Connectez-vous** à votre compte (ou créez-en un)
3. **Cliquez sur le bouton vert "New"** ou sur le "+" en haut à droite
4. **Remplissez les informations** :
   - **Repository name** : `systeme-gestion-stock` (ou le nom de votre choix)
   - **Description** : `Système de gestion intégré pour VITACH GUINÉE - Achats, Stock, Véhicules`
   - **Visibilité** : Choisissez "Public" ou "Private"
   - **NE PAS** cocher "Add a README file" (nous en avons déjà un)
   - **NE PAS** cocher "Add .gitignore" (nous en avons déjà un)
5. **Cliquez sur "Create repository"**

### 2. 🔗 Connecter votre projet local à GitHub

Une fois le repository créé, GitHub vous donnera des commandes. Utilisez celles-ci :

```bash
# Aller dans le dossier de votre projet
cd /Users/bakywimbo/Desktop/stock

# Ajouter tous les fichiers
git add .

# Faire un commit
git commit -m "Initial commit - Système de gestion de stock prêt pour déploiement"

# Ajouter l'origine GitHub (remplacez VOTRE_USERNAME par votre nom d'utilisateur GitHub)
git remote add origin https://github.com/VOTRE_USERNAME/systeme-gestion-stock.git

# Pousser vers GitHub
git push -u origin main
```

### 3. 🚀 Déployer sur Railway

1. **Allez sur [railway.app](https://railway.app)**
2. **Créez un compte** (gratuit)
3. **Cliquez sur "New Project"**
4. **Sélectionnez "Deploy from GitHub repo"**
5. **Autorisez Railway à accéder à votre GitHub**
6. **Sélectionnez votre repository** `systeme-gestion-stock`
7. **Railway détectera automatiquement** que c'est une application Python
8. **Cliquez sur "Deploy"**

### 4. ⚙️ Configurer les variables d'environnement

Dans Railway, allez dans l'onglet "Variables" et ajoutez :

```
SECRET_KEY=-yC9-CPfZhOre1J-wtjk27pKNVEu-kIf5WpJDW9hEHk
DATABASE_URL=sqlite:///./stock_management.db
DEBUG=False
PORT=8000
```

### 5. 🎉 Votre application est déployée !

Railway vous donnera une URL comme : `https://votre-app.railway.app`

## 🔧 Commandes utiles

### Vérifier le statut Git
```bash
git status
```

### Voir les remotes
```bash
git remote -v
```

### Pousser les changements
```bash
git add .
git commit -m "Description des changements"
git push
```

### Voir les logs Railway
```bash
# Si vous avez installé Railway CLI
railway logs
```

## 🆘 Dépannage

### Erreur "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/VOTRE_USERNAME/systeme-gestion-stock.git
```

### Erreur d'authentification GitHub
```bash
# Utilisez un token d'accès personnel
git remote set-url origin https://VOTRE_TOKEN@github.com/VOTRE_USERNAME/systeme-gestion-stock.git
```

### Erreur de push
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

## 📱 Test de l'application déployée

Une fois déployée, testez votre application :

1. **Page d'accueil** : `https://votre-app.railway.app/`
2. **Connexion** : `admin` / `admin123`
3. **API Documentation** : `https://votre-app.railway.app/api/docs`

## 🎯 Prochaines étapes

1. ✅ Créer le repository GitHub
2. ✅ Pousser le code
3. ✅ Déployer sur Railway
4. ✅ Configurer les variables
5. ✅ Tester l'application
6. 🔄 Changer les mots de passe par défaut
7. 🔄 Configurer un domaine personnalisé (optionnel)

---

**Votre système de gestion de stock sera bientôt en ligne ! 🚀**
