# Guide de Déploiement - Système de Gestion de Stock

## 🚀 Options de Déploiement

### 1. **Railway (Recommandé - Gratuit et Simple)**

Railway est une plateforme moderne et gratuite pour déployer des applications Python.

#### Étapes de déploiement sur Railway :

1. **Créer un compte Railway**
   - Aller sur [railway.app](https://railway.app)
   - Se connecter avec GitHub

2. **Connecter le repository**
   - Cliquer sur "New Project"
   - Sélectionner "Deploy from GitHub repo"
   - Choisir votre repository

3. **Configuration automatique**
   - Railway détectera automatiquement que c'est une application Python
   - Il utilisera le `Procfile` et `requirements.txt`

4. **Variables d'environnement**
   - Aller dans "Variables" du projet
   - Ajouter les variables suivantes :
   ```
   SECRET_KEY=votre-cle-secrete-tres-longue-et-complexe
   DATABASE_URL=sqlite:///./stock_management.db
   DEBUG=False
   PORT=8000
   ```

5. **Déploiement**
   - Railway déploiera automatiquement
   - L'URL sera générée automatiquement

---

### 2. **Render (Gratuit avec limitations)**

Render offre un plan gratuit avec des limitations.

#### Étapes de déploiement sur Render :

1. **Créer un compte Render**
   - Aller sur [render.com](https://render.com)
   - Se connecter avec GitHub

2. **Créer un nouveau Web Service**
   - Cliquer sur "New +" → "Web Service"
   - Connecter votre repository GitHub

3. **Configuration**
   - **Build Command** : `pip install -r requirements.txt`
   - **Start Command** : `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Environment** : Python 3

4. **Variables d'environnement**
   ```
   SECRET_KEY=votre-cle-secrete-tres-longue-et-complexe
   DATABASE_URL=sqlite:///./stock_management.db
   DEBUG=False
   ```

5. **Déploiement**
   - Cliquer sur "Create Web Service"
   - Attendre le déploiement

---

### 3. **Heroku (Payant mais très fiable)**

Heroku est une plateforme mature mais maintenant payante.

#### Étapes de déploiement sur Heroku :

1. **Installer Heroku CLI**
   ```bash
   # macOS
   brew install heroku/brew/heroku
   
   # Ou télécharger depuis heroku.com
   ```

2. **Se connecter à Heroku**
   ```bash
   heroku login
   ```

3. **Créer une application**
   ```bash
   heroku create votre-nom-app-stock
   ```

4. **Configurer les variables d'environnement**
   ```bash
   heroku config:set SECRET_KEY="votre-cle-secrete-tres-longue-et-complexe"
   heroku config:set DEBUG=False
   ```

5. **Déployer**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

---

### 4. **VPS/Serveur Personnel**

Pour un déploiement sur votre propre serveur.

#### Étapes de déploiement sur VPS :

1. **Préparer le serveur**
   ```bash
   # Mettre à jour le système
   sudo apt update && sudo apt upgrade -y
   
   # Installer Python 3.12
   sudo apt install python3.12 python3.12-venv python3-pip -y
   
   # Installer Nginx
   sudo apt install nginx -y
   ```

2. **Cloner le projet**
   ```bash
   git clone https://github.com/votre-username/votre-repo.git
   cd votre-repo
   ```

3. **Créer un environnement virtuel**
   ```bash
   python3.12 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Configurer Nginx**
   ```nginx
   server {
       listen 80;
       server_name votre-domaine.com;
       
       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

5. **Créer un service systemd**
   ```ini
   [Unit]
   Description=Stock Management App
   After=network.target
   
   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/path/to/your/app
   Environment=PATH=/path/to/your/app/venv/bin
   ExecStart=/path/to/your/app/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
   Restart=always
   
   [Install]
   WantedBy=multi-user.target
   ```

---

## 🔧 Configuration Post-Déploiement

### Variables d'environnement importantes :

```bash
# Obligatoires
SECRET_KEY=votre-cle-secrete-tres-longue-et-complexe
DATABASE_URL=sqlite:///./stock_management.db
DEBUG=False

# Optionnelles
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=votre-email@gmail.com
SMTP_PASSWORD=votre-mot-de-passe-app
```

### Générer une clé secrète sécurisée :

```python
import secrets
print(secrets.token_urlsafe(32))
```

---

## 🧪 Test du Déploiement

### 1. Vérifier que l'application fonctionne :
```bash
curl https://votre-app.railway.app/health
```

### 2. Tester l'authentification :
```bash
curl -X POST "https://votre-app.railway.app/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123"
```

### 3. Tester la création d'un service :
```bash
curl -X POST "https://votre-app.railway.app/api/services/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -d '{"name": "Service Test", "description": "Test", "department_head": "Test", "email": "test@test.com", "phone": "+224123456789", "location": "Test"}'
```

---

## 📝 Notes Importantes

1. **Base de données** : L'application utilise SQLite par défaut. Pour la production, considérez PostgreSQL.

2. **Sécurité** : Changez toujours la clé secrète et les mots de passe par défaut.

3. **Sauvegarde** : Configurez des sauvegardes régulières de la base de données.

4. **Monitoring** : Surveillez les logs et les performances de l'application.

5. **HTTPS** : Configurez SSL/TLS pour la sécurité.

---

## 🆘 Dépannage

### Problèmes courants :

1. **Erreur de port** : Vérifiez que la variable `PORT` est définie
2. **Erreur de base de données** : Vérifiez les permissions d'écriture
3. **Erreur d'authentification** : Vérifiez la clé secrète
4. **Erreur de dépendances** : Vérifiez le fichier `requirements.txt`

### Logs utiles :
```bash
# Railway
railway logs

# Render
# Voir dans le dashboard Render

# Heroku
heroku logs --tail

# VPS
journalctl -u votre-service -f
```
