from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from typing import List, Optional
import uvicorn
import os

# Import des modules
from database import init_database
from routers import purchases, stock, vehicles, reports, auth, suppliers, maintenance, service_providers, users, purchase_requests, services, pdf_export, stock_movements

# Création de l'application FastAPI
app = FastAPI(
    title="Système de Gestion Intégré",
    description="Gestion complète des achats, stock et logistique avec suivi des véhicules",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Configuration CORS pour permettre les requêtes depuis le frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, spécifiez les domaines autorisés
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routeurs
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(services.router, prefix="/api")
app.include_router(pdf_export.router, prefix="/api")
app.include_router(suppliers.router, prefix="/api")
app.include_router(service_providers.router, prefix="/api")
app.include_router(purchase_requests.router, prefix="/api")
app.include_router(purchases.router, prefix="/api")
app.include_router(stock.router, prefix="/api")
app.include_router(vehicles.router, prefix="/api")
app.include_router(reports.router, prefix="/api")
app.include_router(maintenance.router, prefix="/api")
app.include_router(stock_movements.router, prefix="/api")

# Route de connexion (page HTML)
@app.get("/login", response_class=HTMLResponse)
async def login_page():
    """Page de connexion HTML"""
    return """
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Connexion - Système de Gestion</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .login-container {
                background: rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
                border-radius: 20px;
                padding: 3rem;
                width: 100%;
                max-width: 400px;
                border: 1px solid rgba(255,255,255,0.2);
            }
            h1 {
                text-align: center;
                margin-bottom: 2rem;
                font-size: 2rem;
            }
            .form-group {
                margin-bottom: 1.5rem;
            }
            label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: bold;
            }
            input {
                width: 100%;
                padding: 1rem;
                border: 2px solid rgba(255,255,255,0.3);
                border-radius: 10px;
                background: rgba(255,255,255,0.1);
                color: white;
                font-size: 1rem;
            }
            input::placeholder {
                color: rgba(255,255,255,0.7);
            }
            button {
                width: 100%;
                padding: 1rem;
                background: rgba(255,255,255,0.2);
                border: 2px solid rgba(255,255,255,0.3);
                border-radius: 10px;
                color: white;
                font-size: 1.1rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            button:hover {
                background: rgba(255,255,255,0.3);
                transform: translateY(-2px);
            }
            .back-btn {
                display: block;
                text-align: center;
                margin-top: 1rem;
                color: rgba(255,255,255,0.8);
                text-decoration: none;
            }
            .back-btn:hover {
                color: white;
            }
        </style>
    </head>
    <body>
        <div class="login-container">
            <h1>🔐 Connexion</h1>
            <form id="loginForm">
                <div class="form-group">
                    <label for="username">Nom d'utilisateur</label>
                    <input type="text" id="username" name="username" placeholder="Entrez votre nom d'utilisateur" required>
                </div>
                <div class="form-group">
                    <label for="password">Mot de passe</label>
                    <input type="password" id="password" name="password" placeholder="Entrez votre mot de passe" required>
                </div>
                <button type="submit">Se connecter</button>
            </form>
            <a href="/" class="back-btn">← Retour à l'accueil</a>
        </div>
        
        <script>
            document.getElementById('loginForm').addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = new FormData(e.target);
                const username = formData.get('username');
                const password = formData.get('password');
                
                try {
                    const response = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        alert('Connexion reussie ! Vous allez etre redirige vers la documentation API.');
                        window.location.href = '/api/docs';
                    } else if (response.status === 401) {
                        alert('Erreur d\\'authentification: Nom d\\'utilisateur ou mot de passe incorrect.\\n\\nUtilisez:\\n- Nom d\\'utilisateur: admin\\n- Mot de passe: admin123');
                    } else {
                        const error = await response.json().catch(() => ({ detail: 'Erreur inconnue' }));
                        alert('Erreur: ' + error.detail);
                    }
                } catch (error) {
                    if (error.message.includes('ERR_NETWORK_CHANGED') || error.message.includes('ERR_NAME_NOT_RESOLVED')) {
                        alert('Erreur de connexion reseau. Veuillez reessayer dans quelques instants.');
                    } else {
                        alert('Erreur de connexion: ' + error.message);
                    }
                }
            });
        </script>
    </body>
    </html>
    """

# Route tableau de bord
@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard():
    """Tableau de bord de l'application"""
    return """
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tableau de Bord - Système de Gestion</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: white;
                padding: 2rem;
            }
            .dashboard {
                max-width: 1200px;
                margin: 0 auto;
            }
            .header {
                text-align: center;
                margin-bottom: 3rem;
            }
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 2rem;
                margin-bottom: 3rem;
            }
            .stat-card {
                background: rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
                border-radius: 15px;
                padding: 2rem;
                text-align: center;
                border: 1px solid rgba(255,255,255,0.2);
            }
            .stat-number {
                font-size: 3rem;
                font-weight: bold;
                margin-bottom: 0.5rem;
            }
            .stat-label {
                font-size: 1.1rem;
                opacity: 0.9;
            }
            .modules-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 2rem;
            }
            .module-card {
                background: rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
                border-radius: 15px;
                padding: 2rem;
                border: 1px solid rgba(255,255,255,0.2);
                transition: transform 0.3s ease;
            }
            .module-card:hover {
                transform: translateY(-5px);
            }
            .module-title {
                font-size: 1.5rem;
                margin-bottom: 1rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .module-actions {
                display: flex;
                gap: 1rem;
                margin-top: 1rem;
            }
            .btn {
                background: rgba(255,255,255,0.2);
                border: 2px solid rgba(255,255,255,0.3);
                color: white;
                padding: 0.75rem 1.5rem;
                text-decoration: none;
                border-radius: 25px;
                transition: all 0.3s ease;
                font-weight: bold;
            }
            .btn:hover {
                background: rgba(255,255,255,0.3);
                transform: translateY(-2px);
            }
            .back-btn {
                position: fixed;
                top: 2rem;
                left: 2rem;
                background: rgba(255,255,255,0.2);
                border: 2px solid rgba(255,255,255,0.3);
                color: white;
                padding: 1rem;
                text-decoration: none;
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            .back-btn:hover {
                background: rgba(255,255,255,0.3);
            }
        </style>
    </head>
    <body>
        <a href="/" class="back-btn">←</a>
        
        <div class="dashboard">
            <div class="header">
                <h1>📊 Tableau de Bord</h1>
                <p>Système de Gestion Intégré - Vue d'ensemble</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">24</div>
                    <div class="stat-label">Articles en Stock</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">8</div>
                    <div class="stat-label">Véhicules Actifs</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">15</div>
                    <div class="stat-label">Achats ce Mois</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">3</div>
                    <div class="stat-label">Maintenances Pending</div>
                </div>
            </div>
            
            <div class="modules-grid">
                <div class="module-card">
                    <div class="module-title">
                        📦 Gestion des Stocks
                    </div>
                    <p>Gérez vos articles, niveaux de stock et mouvements d'inventaire.</p>
                    <div class="module-actions">
                        <a href="/stock" class="btn">Voir Stock</a>
                        <a href="/api/docs#/stock" class="btn">API Stock</a>
                    </div>
                </div>
                
                <div class="module-card">
                    <div class="module-title">
                        🚗 Gestion des Véhicules
                    </div>
                    <p>Suivez vos véhicules, maintenance et coûts d'exploitation.</p>
                    <div class="module-actions">
                        <a href="/vehicles" class="btn">Voir Véhicules</a>
                        <a href="/api/docs#/vehicles" class="btn">API Véhicules</a>
                    </div>
                </div>
                
                <div class="module-card">
                    <div class="module-title">
                        💰 Gestion des Achats
                    </div>
                    <p>Planifiez et suivez vos achats et fournisseurs.</p>
                    <div class="module-actions">
                        <a href="/purchases" class="btn">Voir Achats</a>
                        <a href="/api/docs#/purchases" class="btn">API Achats</a>
                    </div>
                </div>
                
                <div class="module-card">
                    <div class="module-title">
                        📋 Rapports & Analyses
                    </div>
                    <p>Générez des rapports et analysez vos données.</p>
                    <div class="module-actions">
                        <a href="/reports" class="btn">Voir Rapports</a>
                        <a href="/api/docs#/reports" class="btn">API Rapports</a>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

# Route gestion de stock
@app.get("/stock", response_class=HTMLResponse)
async def stock_management():
    """Interface de gestion de stock"""
    return """
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gestion de Stock - Système de Gestion</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: white;
                padding: 2rem;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
            }
            .header {
                text-align: center;
                margin-bottom: 3rem;
            }
            .stock-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 2rem;
                margin-bottom: 3rem;
            }
            .stock-card {
                background: rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
                border-radius: 15px;
                padding: 2rem;
                border: 1px solid rgba(255,255,255,0.2);
            }
            .stock-title {
                font-size: 1.3rem;
                margin-bottom: 1rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .stock-list {
                list-style: none;
            }
            .stock-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0.75rem 0;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            .stock-item:last-child {
                border-bottom: none;
            }
            .stock-quantity {
                background: rgba(255,255,255,0.2);
                padding: 0.25rem 0.75rem;
                border-radius: 15px;
                font-weight: bold;
            }
            .btn {
                background: rgba(255,255,255,0.2);
                border: 2px solid rgba(255,255,255,0.3);
                color: white;
                padding: 0.75rem 1.5rem;
                text-decoration: none;
                border-radius: 25px;
                transition: all 0.3s ease;
                font-weight: bold;
                margin: 0.5rem;
                display: inline-block;
            }
            .btn:hover {
                background: rgba(255,255,255,0.3);
                transform: translateY(-2px);
            }
            .back-btn {
                position: fixed;
                top: 2rem;
                left: 2rem;
                background: rgba(255,255,255,0.2);
                border: 2px solid rgba(255,255,255,0.3);
                color: white;
                padding: 1rem;
                text-decoration: none;
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            .back-btn:hover {
                background: rgba(255,255,255,0.3);
            }
        </style>
    </head>
    <body>
        <a href="/" class="back-btn">←</a>
        
        <div class="container">
            <div class="header">
                <h1>📦 Gestion de Stock</h1>
                <p>Interface de gestion des articles et inventaire</p>
            </div>
            
            <div class="stock-grid">
                <div class="stock-card">
                    <div class="stock-title">
                        🔧 Outils & Équipements
                    </div>
                    <ul class="stock-list">
                        <li class="stock-item">
                            <span>Clés Allen</span>
                            <span class="stock-quantity">45</span>
                        </li>
                        <li class="stock-item">
                            <span>Tournevis</span>
                            <span class="stock-quantity">23</span>
                        </li>
                        <li class="stock-item">
                            <span>Pinces</span>
                            <span class="stock-quantity">18</span>
                        </li>
                        <li class="stock-item">
                            <span>Multimètre</span>
                            <span class="stock-quantity">8</span>
                        </li>
                    </ul>
                </div>
                
                <div class="stock-card">
                    <div class="stock-title">
                        🔋 Batteries & Électronique
                    </div>
                    <ul class="stock-list">
                        <li class="stock-item">
                            <span>Batterie 12V</span>
                            <span class="stock-quantity">12</span>
                        </li>
                        <li class="stock-item">
                            <span>Câbles USB</span>
                            <span class="stock-quantity">35</span>
                        </li>
                        <li class="stock-item">
                            <span>Adaptateurs</span>
                            <span class="stock-quantity">22</span>
                        </li>
                        <li class="stock-item">
                            <span>Capteurs</span>
                            <span class="stock-quantity">15</span>
                        </li>
                    </ul>
                </div>
                
                <div class="stock-card">
                    <div class="stock-title">
                        🛠️ Pièces de Rechange
                    </div>
                    <ul class="stock-list">
                        <li class="stock-item">
                            <span>Filtres à air</span>
                            <span class="stock-quantity">28</span>
                        </li>
                        <li class="stock-item">
                            <span>Courroies</span>
                            <span class="stock-quantity">14</span>
                        </li>
                        <li class="stock-item">
                            <span>Huile moteur</span>
                            <span class="stock-quantity">6</span>
                        </li>
                        <li class="stock-item">
                            <span>Bougies</span>
                            <span class="stock-quantity">42</span>
                        </li>
                    </ul>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 3rem;">
                <a href="/api/docs#/stock" class="btn">📚 API Documentation</a>
                <a href="/health" class="btn">🔍 État du Système</a>
                <a href="/dashboard" class="btn">📊 Tableau de Bord</a>
            </div>
        </div>
    </body>
    </html>
    """

# Route de santé
@app.get("/health")
async def health_check():
    """Vérification de l'état de l'application"""
    return {
        "status": "healthy", 
        "message": "Système de Gestion Intégré - Opérationnel",
        "version": "2.0.0"
    }

# Route principale simplifiée
@app.get("/", response_class=HTMLResponse)
async def root():
    """Page d'accueil simplifiée pour Heroku"""
    return """
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Système de Gestion Intégré</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                text-align: center;
                max-width: 600px;
                padding: 2rem;
            }
            h1 {
                font-size: 3rem;
                margin-bottom: 1rem;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
            }
            .subtitle {
                font-size: 1.2rem;
                margin-bottom: 2rem;
                opacity: 0.9;
            }
            .buttons {
                display: flex;
                gap: 1rem;
                justify-content: center;
                flex-wrap: wrap;
            }
            .btn {
                background: rgba(255,255,255,0.2);
                border: 2px solid rgba(255,255,255,0.3);
                color: white;
                padding: 1rem 2rem;
                text-decoration: none;
                border-radius: 50px;
                transition: all 0.3s ease;
                font-weight: bold;
            }
            .btn:hover {
                background: rgba(255,255,255,0.3);
                border-color: rgba(255,255,255,0.5);
                transform: translateY(-2px);
            }
            .status {
                margin-top: 2rem;
                padding: 1rem;
                background: rgba(255,255,255,0.1);
                border-radius: 10px;
                border: 1px solid rgba(255,255,255,0.2);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🏢 Système de Gestion Intégré</h1>
            <p class="subtitle">Gestion complète des achats, stock et logistique</p>
            
            <div class="buttons">
                <a href="/api/docs" class="btn">📚 Documentation API</a>
                <a href="/health" class="btn">🔍 État du Système</a>
                <a href="/dashboard" class="btn">📊 Tableau de Bord</a>
                <a href="/stock" class="btn">📦 Gestion Stock</a>
            </div>
            
            <div class="status">
                <h3>✅ Application Déployée avec Succès</h3>
                <p>Version 2.0.0 - Heroku</p>
                <p><strong>Identifiants de test :</strong> admin / admin123</p>
            </div>
        </div>
    </body>
    </html>
    """

# Initialisation de la base de données au démarrage
@app.on_event("startup")
async def startup_event():
    """Initialisation au démarrage de l'application"""
    try:
    init_database()
        print("✅ Base de données initialisée")
        
        # Créer l'utilisateur admin par défaut s'il n'existe pas
        try:
            from create_admin import create_admin_if_not_exists
            create_admin_if_not_exists()
        except Exception as e:
            print(f"❌ Erreur lors de la création de l'utilisateur admin: {e}")
            
    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    print("🚀 Starting application with bcrypt fix applied - VERSION 51fe13a")
    uvicorn.run(app, host="0.0.0.0", port=8000)
