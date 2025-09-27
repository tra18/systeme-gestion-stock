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
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .login-card {
                background: white;
                border-radius: 20px;
                padding: 3rem;
                width: 100%;
                max-width: 450px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                text-align: center;
            }
            .rocket-icon {
                font-size: 3rem;
                color: #666;
                margin-bottom: 1rem;
            }
            h1 {
                color: #333;
                font-size: 2.5rem;
                font-weight: bold;
                margin-bottom: 0.5rem;
            }
            .subtitle {
                color: #666;
                font-size: 1.1rem;
                margin-bottom: 2.5rem;
            }
            .form-group {
                margin-bottom: 1.5rem;
                text-align: left;
            }
            label {
                display: flex;
                align-items: center;
                margin-bottom: 0.5rem;
                color: #333;
                font-weight: 500;
            }
            .label-icon {
                margin-right: 0.5rem;
                font-size: 1.2rem;
            }
            input {
                width: 100%;
                padding: 1rem;
                border: 2px solid #e1e5e9;
                border-radius: 10px;
                font-size: 1rem;
                transition: border-color 0.3s ease;
            }
            input:focus {
                outline: none;
                border-color: #667eea;
            }
            .login-btn {
                width: 100%;
                padding: 1rem;
                background: #667eea;
                border: none;
                border-radius: 10px;
                color: white;
                font-size: 1.1rem;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
            }
            .login-btn:hover {
                background: #5a6fd8;
                transform: translateY(-2px);
            }
            .demo-accounts {
                margin-top: 2rem;
                padding: 1.5rem;
                background: #f8f9fa;
                border-radius: 10px;
                text-align: left;
            }
            .demo-title {
                display: flex;
                align-items: center;
                margin-bottom: 1rem;
                color: #333;
                font-weight: 600;
            }
            .info-icon {
                margin-right: 0.5rem;
                color: #667eea;
            }
            .account-item {
                margin-bottom: 0.5rem;
                color: #666;
            }
            .account-role {
                color: #667eea;
                font-weight: 600;
            }
            .footer {
                margin-top: 2rem;
                color: #999;
                font-size: 0.9rem;
            }
            .footer-title {
                color: #333;
                font-weight: 600;
                margin-bottom: 0.5rem;
            }
        </style>
    </head>
    <body>
        <div class="login-card">
            <div class="rocket-icon">🚀</div>
            <h1>Connexion</h1>
            <p class="subtitle">Système de Gestion Intégré</p>
            
            <form id="loginForm">
                <div class="form-group">
                    <label for="username">
                        <span class="label-icon">👤</span>
                        Nom d'utilisateur
                    </label>
                    <input type="text" id="username" name="username" value="admin123" required>
                </div>
                <div class="form-group">
                    <label for="password">
                        <span class="label-icon">🔒</span>
                        Mot de passe
                    </label>
                    <input type="password" id="password" name="password" value="admin123" required>
                </div>
                <button type="submit" class="login-btn">
                    <span>→</span>
                    Se connecter
                </button>
            </form>
            
            <div class="demo-accounts">
                <div class="demo-title">
                    <span class="info-icon">ℹ️</span>
                    Comptes de démonstration
                </div>
                <div class="account-item">
                    <span class="account-role">Admin:</span> admin / admin123
                </div>
                <div class="account-item">
                    <span class="account-role">Manager:</span> manager / manager123
                </div>
                <div class="account-item">
                    <span class="account-role">Utilisateur:</span> user / user123
                </div>
            </div>
            
            <div class="footer">
                <div class="footer-title">© 2024 Système de Gestion Intégré</div>
                Gestion des achats, stock et logistique
            </div>
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
                        alert('Connexion réussie ! Vous allez être redirigé vers le tableau de bord.');
                        window.location.href = '/dashboard';
                    } else if (response.status === 401) {
                        alert('Erreur d\\'authentification: Nom d\\'utilisateur ou mot de passe incorrect.');
                    } else {
                        const error = await response.json().catch(() => ({ detail: 'Erreur inconnue' }));
                        alert('Erreur: ' + error.detail);
                    }
                } catch (error) {
                        alert('Erreur de connexion: ' + error.message);
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
                padding: 1rem;
            }
            .dashboard {
                max-width: 1200px;
                margin: 0 auto;
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                body {
                    padding: 0.5rem;
                }
                .header-card {
                    padding: 1.5rem;
                    margin-bottom: 1rem;
                }
                .header-title {
                    font-size: 1.8rem;
                }
                .header-subtitle {
                    font-size: 1rem;
                }
                .stats-grid {
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1rem;
                }
                .modules-grid {
                    grid-template-columns: 1fr;
                    gap: 1rem;
                }
                .module-card {
                    padding: 1.5rem;
                }
                .module-actions {
                    flex-direction: column;
                }
                .btn {
                    width: 100%;
                    text-align: center;
                }
            }
            
            @media (max-width: 480px) {
                .header-title {
                    font-size: 1.5rem;
                }
                .stats-grid {
                    grid-template-columns: 1fr;
                }
                .stat-card {
                    padding: 1rem;
                }
                .stat-number {
                    font-size: 2rem;
                }
            }
            .header-card {
                background: white;
                border-radius: 20px;
                padding: 3rem;
                text-align: center;
                margin-bottom: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .header-icon {
                font-size: 3rem;
                color: #667eea;
                margin-bottom: 1rem;
            }
            .header-title {
                color: #333;
                font-size: 2.5rem;
                font-weight: bold;
                margin-bottom: 0.5rem;
            }
            .header-subtitle {
                color: #666;
                font-size: 1.2rem;
            }
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
            }
            .stat-card {
                background: white;
                border-radius: 15px;
                padding: 2rem;
                text-align: center;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                transition: transform 0.3s ease;
            }
            .stat-card:hover {
                transform: translateY(-5px);
            }
            .stat-icon {
                font-size: 2.5rem;
                margin-bottom: 1rem;
            }
            .stat-number {
                font-size: 2.5rem;
                font-weight: bold;
                color: #333;
                margin-bottom: 0.5rem;
            }
            .stat-label {
                color: #666;
                font-size: 1.1rem;
            }
            .modules-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 2rem;
                margin-bottom: 2rem;
            }
            .module-card {
                background: white;
                border-radius: 20px;
                padding: 2.5rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                transition: transform 0.3s ease;
            }
            .module-card:hover {
                transform: translateY(-5px);
            }
            .module-icon {
                font-size: 3rem;
                color: #667eea;
                margin-bottom: 1rem;
            }
            .module-title {
                font-size: 1.8rem;
                font-weight: bold;
                color: #333;
                margin-bottom: 1rem;
            }
            .module-description {
                color: #666;
                line-height: 1.6;
                margin-bottom: 2rem;
            }
            .module-actions {
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
            }
            .btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 25px;
                text-decoration: none;
                font-weight: bold;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            .btn-primary {
                background: #667eea;
                color: white;
            }
            .btn-primary:hover {
                background: #5a6fd8;
                transform: translateY(-2px);
            }
            .btn-success {
                background: #28a745;
                color: white;
            }
            .btn-success:hover {
                background: #218838;
                transform: translateY(-2px);
            }
            .btn-warning {
                background: #ffc107;
                color: #333;
            }
            .btn-warning:hover {
                background: #e0a800;
                transform: translateY(-2px);
            }
            .btn-danger {
                background: #dc3545;
                color: white;
            }
            .btn-danger:hover {
                background: #c82333;
                transform: translateY(-2px);
            }
            .analytics-card {
                background: white;
                border-radius: 20px;
                padding: 2.5rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                margin-top: 2rem;
            }
        </style>
    </head>
    <body>
        <div class="dashboard">
            <div class="header-card">
                <div class="header-icon">🚀</div>
                <h1 class="header-title">Système de Gestion Intégré</h1>
                <p class="header-subtitle">Gestion complète des achats, stock et logistique avec suivi des véhicules</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">🛒</div>
                    <div class="stat-number">0 GNF</div>
                    <div class="stat-label">Total Achats</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🚗</div>
                    <div class="stat-number">2</div>
                    <div class="stat-label">Véhicules</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⚠️</div>
                    <div class="stat-number">0</div>
                    <div class="stat-label">Stock Bas</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🔧</div>
                    <div class="stat-number">0</div>
                    <div class="stat-label">Maintenances</div>
                </div>
            </div>
            
            <div class="modules-grid">
                <div class="module-card">
                    <div class="module-icon">🛒</div>
                    <h2 class="module-title">Gestion des Achats</h2>
                    <p class="module-description">Enregistrez et suivez vos achats par période (journalier, hebdomadaire, mensuel, semestriel, annuel). Analysez les dépenses par catégorie et générez des rapports détaillés.</p>
                    <div class="module-actions">
                        <a href="/purchase-requests" class="btn btn-success">+ Nouvelle Demande</a>
                        <a href="/purchase-requests" class="btn btn-primary">📋 Voir Demandes</a>
                    </div>
                </div>
                
                <div class="module-card">
                    <div class="module-icon">📦</div>
                    <h2 class="module-title">Gestion du Stock</h2>
                    <p class="module-description">Contrôlez votre inventaire avec alertes de seuil automatiques. Gérez les mouvements de stock et recevez des notifications de réapprovisionnement.</p>
                    <div class="module-actions">
                        <a href="/stock" class="btn btn-warning">+ Ajouter Article</a>
                        <a href="/stock" class="btn btn-primary">📋 Voir Stock</a>
                    </div>
                </div>
                
                <div class="module-card">
                    <div class="module-icon">🚚</div>
                    <h2 class="module-title">Suivi des Véhicules</h2>
                    <p class="module-description">Gérez l'entretien, le carburant et l'historique complet de vos véhicules. Planifiez les maintenances et suivez les coûts d'exploitation.</p>
                    <div class="module-actions">
                        <a href="/vehicles" class="btn btn-danger">+ Nouveau Véhicule</a>
                        <a href="/vehicles" class="btn btn-primary">📋 Voir Véhicules</a>
                    </div>
                </div>
            </div>
            
            <div class="analytics-card">
                <div class="module-icon">📊</div>
                <h2 class="module-title">Rapports & Analytics</h2>
                <p class="module-description">Tableaux de bord interactifs, rapports financiers détaillés et analyses prédictives. Visualisez les tendances et optimisez vos processus.</p>
                    <div class="module-actions">
                    <a href="/reports" class="btn btn-primary">📋 Voir Rapports</a>
                    <a href="/reports" class="btn btn-success">+ Nouveau Rapport</a>
                    </div>
                </div>
        </div>
    </body>
    </html>
    """

# Route gestion des demandes d'achat
@app.get("/purchase-requests", response_class=HTMLResponse)
async def purchase_requests_management():
    """Interface de gestion des demandes d'achat avec workflow"""
    return """
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Demandes d'Achat - Système de Gestion</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 2rem;
            }
            .container {
                max-width: 1400px;
                margin: 0 auto;
            }
            .header {
                background: white;
                border-radius: 20px;
                padding: 2rem;
                text-align: center;
                margin-bottom: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .header-icon {
                font-size: 3rem;
                color: #667eea;
                margin-bottom: 1rem;
            }
            .header-title {
                color: #333;
                font-size: 2.5rem;
                font-weight: bold;
                margin-bottom: 0.5rem;
            }
            .header-subtitle {
                color: #666;
                font-size: 1.2rem;
            }
            .workflow-steps {
                background: white;
                border-radius: 15px;
                padding: 1.5rem;
                margin-bottom: 2rem;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
            }
            .step {
                display: flex;
                flex-direction: column;
                align-items: center;
                flex: 1;
                min-width: 150px;
                position: relative;
            }
            .step:not(:last-child)::after {
                content: '→';
                position: absolute;
                right: -20px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 1.5rem;
                color: #667eea;
            }
            .step-icon {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                margin-bottom: 0.5rem;
            }
            .step-pending {
                background: #f8f9fa;
                color: #6c757d;
            }
            .step-active {
                background: #667eea;
                color: white;
            }
            .step-completed {
                background: #28a745;
                color: white;
            }
            .step-label {
                font-size: 0.9rem;
                font-weight: bold;
                text-align: center;
            }
            .actions-bar {
                background: white;
                border-radius: 15px;
                padding: 1.5rem;
                margin-bottom: 2rem;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
                align-items: center;
            }
            .btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 25px;
                text-decoration: none;
                font-weight: bold;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            .btn-success {
                background: #28a745;
                color: white;
            }
            .btn-success:hover {
                background: #218838;
                transform: translateY(-2px);
            }
            .btn-primary {
                background: #667eea;
                color: white;
            }
            .btn-primary:hover {
                background: #5a6fd8;
                transform: translateY(-2px);
            }
            .btn-warning {
                background: #ffc107;
                color: #333;
            }
            .btn-warning:hover {
                background: #e0a800;
                transform: translateY(-2px);
            }
            .btn-danger {
                background: #dc3545;
                color: white;
            }
            .btn-danger:hover {
                background: #c82333;
                transform: translateY(-2px);
            }
            .search-bar {
                flex: 1;
                min-width: 300px;
            }
            .search-bar input {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #e1e5e9;
                border-radius: 25px;
                font-size: 1rem;
            }
            .search-bar input:focus {
                outline: none;
                border-color: #667eea;
            }
            .table-container {
                background: white;
                border-radius: 20px;
                padding: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                overflow-x: auto;
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            th, td {
                padding: 1rem;
                text-align: left;
                border-bottom: 1px solid #e1e5e9;
            }
            th {
                background: #f8f9fa;
                font-weight: bold;
                color: #333;
            }
            .status-badge {
                padding: 0.25rem 0.75rem;
                border-radius: 15px;
                font-size: 0.9rem;
                font-weight: bold;
            }
            .status-draft {
                background: #f8f9fa;
                color: #6c757d;
            }
            .status-pending {
                background: #fff3cd;
                color: #856404;
            }
            .status-approved {
                background: #d4edda;
                color: #155724;
            }
            .status-purchased {
                background: #d1ecf1;
                color: #0c5460;
            }
            .status-received {
                background: #e2e3e5;
                color: #383d41;
            }
            .action-buttons {
                display: flex;
                gap: 0.5rem;
            }
            .btn-sm {
                padding: 0.5rem;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1rem;
            }
            .back-btn {
                position: fixed;
                top: 2rem;
                left: 2rem;
                background: rgba(255,255,255,0.9);
                border: 2px solid rgba(255,255,255,0.3);
                color: #333;
                padding: 1rem;
                text-decoration: none;
                border-radius: 50%;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            .back-btn:hover {
                background: white;
                transform: translateY(-2px);
            }
            .home-btn {
                position: fixed;
                top: 2rem;
                right: 2rem;
                background: rgba(102, 126, 234, 0.9);
                border: 2px solid rgba(102, 126, 234, 0.3);
                color: white;
                padding: 1rem;
                text-decoration: none;
                border-radius: 50%;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                z-index: 1000;
            }
            .home-btn:hover {
                background: #667eea;
                transform: translateY(-2px);
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                body {
                    padding: 0.5rem;
                }
                .container {
                    max-width: 100%;
                }
                .header {
                    padding: 1.5rem;
                    margin-bottom: 1rem;
                }
                .header-title {
                    font-size: 1.8rem;
                }
                .workflow-steps {
                    flex-direction: column;
                    gap: 1rem;
                }
                .step:not(:last-child)::after {
                    content: '↓';
                    right: 50%;
                    top: auto;
                    bottom: -20px;
                    transform: translateX(50%);
                }
                .actions-bar {
                    flex-direction: column;
                    gap: 1rem;
                }
                .search-bar {
                    min-width: 100%;
                }
                .table-container {
                    padding: 1rem;
                }
                table {
                    font-size: 0.9rem;
                }
                th, td {
                    padding: 0.5rem;
                }
                .action-buttons {
                    flex-direction: column;
                    gap: 0.25rem;
                }
                .btn-sm {
                    width: 35px;
                    height: 35px;
                    font-size: 0.9rem;
                }
                .back-btn, .home-btn {
                    position: relative;
                    top: auto;
                    left: auto;
                    right: auto;
                    margin: 0.5rem;
                    display: inline-block;
                }
            }
            
            @media (max-width: 480px) {
                .header-title {
                    font-size: 1.5rem;
                }
                .workflow-steps {
                    padding: 1rem;
                }
                .step {
                    min-width: 100px;
                }
                .step-icon {
                    width: 40px;
                    height: 40px;
                    font-size: 1.2rem;
                }
                .step-label {
                    font-size: 0.8rem;
                }
                table {
                    font-size: 0.8rem;
                }
                th, td {
                    padding: 0.25rem;
                }
                .status-badge {
                    font-size: 0.8rem;
                    padding: 0.2rem 0.5rem;
                }
            }
        </style>
    </head>
    <body>
        <a href="/dashboard" class="back-btn">←</a>
        <a href="/dashboard" class="home-btn">🏠</a>
        
        <div class="container">
            <div class="header">
                <div class="header-icon">📋</div>
                <h1 class="header-title">Demandes d'Achat</h1>
                <p class="header-subtitle">Workflow de validation et de réception des demandes d'achat</p>
            </div>
            
            <div class="workflow-steps">
                <div class="step">
                    <div class="step-icon step-completed">1</div>
                    <div class="step-label">Demande<br>Créée</div>
                </div>
                <div class="step">
                    <div class="step-icon step-active">2</div>
                    <div class="step-label">Validation<br>Responsable</div>
                </div>
                <div class="step">
                    <div class="step-icon step-pending">3</div>
                    <div class="step-label">Achat<br>Effectué</div>
                </div>
                <div class="step">
                    <div class="step-icon step-pending">4</div>
                    <div class="step-label">Réception<br>Service</div>
                </div>
            </div>
            
            <div class="actions-bar">
                <a href="#" class="btn btn-success" onclick="showAddForm()">+ Nouvelle Demande</a>
                <a href="#" class="btn btn-primary" onclick="refreshTable()">🔄 Actualiser</a>
                <a href="#" class="btn btn-warning" onclick="exportData()">📊 Exporter</a>
                <div class="search-bar">
                    <input type="text" placeholder="Rechercher par numéro, service ou article..." onkeyup="filterTable(this.value)">
                    </div>
            </div>
            
            <div class="table-container">
                <table id="requestsTable">
                    <thead>
                        <tr>
                            <th>N° Demande</th>
                            <th>Service Demandeur</th>
                            <th>Article</th>
                            <th>Quantité</th>
                            <th>Urgence</th>
                            <th>Date Demande</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>DEM-20240925-001</td>
                            <td>Ressources Humaines</td>
                            <td>Papier A4</td>
                            <td>10 paquets</td>
                            <td>Normale</td>
                            <td>25/09/2024</td>
                            <td><span class="status-badge status-pending">En attente validation</span></td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-primary btn-sm" onclick="viewRequest(1)" title="Voir">👁️</button>
                                    <button class="btn btn-success btn-sm" onclick="approveRequest(1)" title="Approuver">✓</button>
                                    <button class="btn btn-danger btn-sm" onclick="rejectRequest(1)" title="Rejeter">✗</button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>DEM-20240924-002</td>
                            <td>Informatique</td>
                            <td>Cartouches d'encre HP</td>
                            <td>5 pièces</td>
                            <td>Urgente</td>
                            <td>24/09/2024</td>
                            <td><span class="status-badge status-approved">Validée</span></td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-primary btn-sm" onclick="viewRequest(2)" title="Voir">👁️</button>
                                    <button class="btn btn-warning btn-sm" onclick="markPurchased(2)" title="Marquer acheté">🛒</button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>DEM-20240923-003</td>
                            <td>Maintenance</td>
                            <td>Outils de réparation</td>
                            <td>1 kit</td>
                            <td>Normale</td>
                            <td>23/09/2024</td>
                            <td><span class="status-badge status-purchased">Acheté</span></td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-primary btn-sm" onclick="viewRequest(3)" title="Voir">👁️</button>
                                    <button class="btn btn-success btn-sm" onclick="markReceived(3)" title="Marquer reçu">📦</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                    </div>
                </div>
                
        <script>
            function showAddForm() {
                window.location.href = '/new-purchase-request';
            }
            
            function refreshTable() {
                location.reload();
            }
            
            function exportData() {
                alert('Fonctionnalité d\\'export à implémenter');
            }
            
            function filterTable(searchTerm) {
                const table = document.getElementById('requestsTable');
                const rows = table.getElementsByTagName('tr');
                
                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i];
                    const text = row.textContent.toLowerCase();
                    if (text.includes(searchTerm.toLowerCase())) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }
            }
            
            function viewRequest(id) {
                alert('Voir demande ID: ' + id);
            }
            
            function approveRequest(id) {
                window.location.href = '/approval/' + id;
            }
            
            function rejectRequest(id) {
                if (confirm('Rejeter cette demande d\\'achat ?')) {
                    // Mettre à jour le statut dans localStorage
                    updateRequestStatus(id, 'rejected');
                    alert('Demande rejetée');
                    location.reload();
                }
            }
            
            function markPurchased(id) {
                if (confirm('Marquer cette demande comme achetée ?')) {
                    // Mettre à jour le statut dans localStorage
                    updateRequestStatus(id, 'purchased');
                    alert('Demande marquée comme achetée - Stock mis à jour automatiquement');
                    location.reload();
                }
            }
            
            function markReceived(id) {
                if (confirm('Marquer cette demande comme reçue ?')) {
                    // Mettre à jour le statut dans localStorage
                    updateRequestStatus(id, 'received');
                    alert('Demande marquée comme reçue - Signature et date de réception automatiques');
                    location.reload();
                }
            }
            
            function updateRequestStatus(id, status) {
                const requests = JSON.parse(localStorage.getItem('purchaseRequests') || '[]');
                const requestIndex = requests.findIndex(req => req.id === id);
                if (requestIndex !== -1) {
                    requests[requestIndex].status = status;
                    requests[requestIndex].updatedAt = new Date().toISOString();
                    localStorage.setItem('purchaseRequests', JSON.stringify(requests));
                }
            }
        </script>
    </body>
    </html>
    """

# Route gestion des achats
@app.get("/purchases", response_class=HTMLResponse)
async def purchases_management():
    """Interface de gestion des achats"""
    return """
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gestion des Achats - Système de Gestion</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 2rem;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
            }
            .header {
                background: white;
                border-radius: 20px;
                padding: 2rem;
                text-align: center;
                margin-bottom: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .header-icon {
                font-size: 3rem;
                color: #667eea;
                margin-bottom: 1rem;
            }
            .header-title {
                color: #333;
                font-size: 2.5rem;
                font-weight: bold;
                margin-bottom: 0.5rem;
            }
            .header-subtitle {
                color: #666;
                font-size: 1.2rem;
            }
            .actions-bar {
                background: white;
                border-radius: 15px;
                padding: 1.5rem;
                margin-bottom: 2rem;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
                align-items: center;
            }
            .btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 25px;
                text-decoration: none;
                font-weight: bold;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            .btn-success {
                background: #28a745;
                color: white;
            }
            .btn-success:hover {
                background: #218838;
                transform: translateY(-2px);
            }
            .btn-primary {
                background: #667eea;
                color: white;
            }
            .btn-primary:hover {
                background: #5a6fd8;
                transform: translateY(-2px);
            }
            .btn-warning {
                background: #ffc107;
                color: #333;
            }
            .btn-warning:hover {
                background: #e0a800;
                transform: translateY(-2px);
            }
            .btn-danger {
                background: #dc3545;
                color: white;
            }
            .btn-danger:hover {
                background: #c82333;
                transform: translateY(-2px);
            }
            .search-bar {
                flex: 1;
                min-width: 300px;
            }
            .search-bar input {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #e1e5e9;
                border-radius: 25px;
                font-size: 1rem;
            }
            .search-bar input:focus {
                outline: none;
                border-color: #667eea;
            }
            .table-container {
                background: white;
                border-radius: 20px;
                padding: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                overflow-x: auto;
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            th, td {
                padding: 1rem;
                text-align: left;
                border-bottom: 1px solid #e1e5e9;
            }
            th {
                background: #f8f9fa;
                font-weight: bold;
                color: #333;
            }
            .status-badge {
                padding: 0.25rem 0.75rem;
                border-radius: 15px;
                font-size: 0.9rem;
                font-weight: bold;
            }
            .status-pending {
                background: #fff3cd;
                color: #856404;
            }
            .status-approved {
                background: #d4edda;
                color: #155724;
            }
            .status-rejected {
                background: #f8d7da;
                color: #721c24;
            }
            .action-buttons {
                display: flex;
                gap: 0.5rem;
            }
            .btn-sm {
                padding: 0.5rem;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1rem;
            }
            .back-btn {
                position: fixed;
                top: 2rem;
                left: 2rem;
                background: rgba(255,255,255,0.9);
                border: 2px solid rgba(255,255,255,0.3);
                color: #333;
                padding: 1rem;
                text-decoration: none;
                border-radius: 50%;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            .back-btn:hover {
                background: white;
                transform: translateY(-2px);
            }
            .home-btn {
                position: fixed;
                top: 2rem;
                right: 2rem;
                background: rgba(102, 126, 234, 0.9);
                border: 2px solid rgba(102, 126, 234, 0.3);
                color: white;
                padding: 1rem;
                text-decoration: none;
                border-radius: 50%;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                z-index: 1000;
            }
            .home-btn:hover {
                background: #667eea;
                transform: translateY(-2px);
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                body {
                    padding: 0.5rem;
                }
                .container {
                    max-width: 100%;
                }
                .header {
                    padding: 1.5rem;
                    margin-bottom: 1rem;
                }
                .header-title {
                    font-size: 1.8rem;
                }
                .actions-bar {
                    flex-direction: column;
                    gap: 1rem;
                }
                .search-bar {
                    min-width: 100%;
                }
                .table-container {
                    padding: 1rem;
                }
                table {
                    font-size: 0.9rem;
                }
                th, td {
                    padding: 0.5rem;
                }
                .action-buttons {
                    flex-direction: column;
                    gap: 0.25rem;
                }
                .btn-sm {
                    width: 35px;
                    height: 35px;
                    font-size: 0.9rem;
                }
                .back-btn, .home-btn {
                    position: relative;
                    top: auto;
                    left: auto;
                    right: auto;
                    margin: 0.5rem;
                    display: inline-block;
                }
            }
            
            @media (max-width: 480px) {
                .header-title {
                    font-size: 1.5rem;
                }
                table {
                    font-size: 0.8rem;
                }
                th, td {
                    padding: 0.25rem;
                }
                .status-badge {
                    font-size: 0.8rem;
                    padding: 0.2rem 0.5rem;
                }
            }
        </style>
    </head>
    <body>
        <a href="/dashboard" class="back-btn">←</a>
        <a href="/dashboard" class="home-btn">🏠</a>
        
        <div class="container">
            <div class="header">
                <div class="header-icon">🛒</div>
                <h1 class="header-title">Gestion des Achats</h1>
                <p class="header-subtitle">Enregistrez et suivez vos achats par période</p>
                    </div>
            
            <div class="actions-bar">
                <a href="#" class="btn btn-success" onclick="showAddForm()">+ Nouvel Achat</a>
                <a href="#" class="btn btn-primary" onclick="refreshTable()">🔄 Actualiser</a>
                <a href="#" class="btn btn-warning" onclick="exportData()">📊 Exporter</a>
                <div class="search-bar">
                    <input type="text" placeholder="Rechercher par fournisseur, article ou numéro..." onkeyup="filterTable(this.value)">
                    </div>
                </div>
                
            <div class="table-container">
                <table id="purchasesTable">
                    <thead>
                        <tr>
                            <th>N° Achat</th>
                            <th>Fournisseur</th>
                            <th>Article</th>
                            <th>Quantité</th>
                            <th>Prix Unitaire</th>
                            <th>Total</th>
                            <th>Date</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>ACH-001</td>
                            <td>Fournisseur Général</td>
                            <td>Papier A4</td>
                            <td>50</td>
                            <td>3,5 GNF</td>
                            <td>175 GNF</td>
                            <td>25/09/2024</td>
                            <td><span class="status-badge status-approved">Approuvé</span></td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-primary btn-sm" onclick="viewPurchase(1)" title="Voir">👁️</button>
                                    <button class="btn btn-warning btn-sm" onclick="editPurchase(1)" title="Modifier">✏️</button>
                                    <button class="btn btn-danger btn-sm" onclick="deletePurchase(1)" title="Supprimer">🗑️</button>
                    </div>
                            </td>
                        </tr>
                        <tr>
                            <td>ACH-002</td>
                            <td>Équipements Bureau</td>
                            <td>Cartouches d'encre HP</td>
                            <td>5</td>
                            <td>25 GNF</td>
                            <td>125 GNF</td>
                            <td>24/09/2024</td>
                            <td><span class="status-badge status-pending">En attente</span></td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-primary btn-sm" onclick="viewPurchase(2)" title="Voir">👁️</button>
                                    <button class="btn btn-warning btn-sm" onclick="editPurchase(2)" title="Modifier">✏️</button>
                                    <button class="btn btn-danger btn-sm" onclick="deletePurchase(2)" title="Supprimer">🗑️</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
                    </div>
                </div>
                
        <script>
            function showAddForm() {
                alert('Fonctionnalité d\\'ajout d\\'achat à implémenter');
            }
            
            function refreshTable() {
                location.reload();
            }
            
            function exportData() {
                alert('Fonctionnalité d\\'export à implémenter');
            }
            
            function filterTable(searchTerm) {
                const table = document.getElementById('purchasesTable');
                const rows = table.getElementsByTagName('tr');
                
                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i];
                    const text = row.textContent.toLowerCase();
                    if (text.includes(searchTerm.toLowerCase())) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }
            }
            
            function viewPurchase(id) {
                alert('Voir achat ID: ' + id);
            }
            
            function editPurchase(id) {
                alert('Modifier achat ID: ' + id);
            }
            
            function deletePurchase(id) {
                if (confirm('Êtes-vous sûr de vouloir supprimer cet achat ?')) {
                    alert('Supprimer achat ID: ' + id);
                }
            }
        </script>
    </body>
    </html>
    """

# Route gestion des véhicules
@app.get("/vehicles", response_class=HTMLResponse)
async def vehicles_management():
    """Interface de gestion des véhicules"""
    return """
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gestion des Véhicules - Système de Gestion</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 2rem;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
            }
            .header {
                background: white;
                border-radius: 20px;
                padding: 2rem;
                text-align: center;
                margin-bottom: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .header-icon {
                font-size: 3rem;
                color: #667eea;
                margin-bottom: 1rem;
            }
            .header-title {
                color: #333;
                font-size: 2.5rem;
                font-weight: bold;
                margin-bottom: 0.5rem;
            }
            .header-subtitle {
                color: #666;
                font-size: 1.2rem;
            }
            .actions-bar {
                background: white;
                border-radius: 15px;
                padding: 1.5rem;
                margin-bottom: 2rem;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
                align-items: center;
            }
            .btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 25px;
                text-decoration: none;
                font-weight: bold;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            .btn-success {
                background: #28a745;
                color: white;
            }
            .btn-success:hover {
                background: #218838;
                transform: translateY(-2px);
            }
            .btn-primary {
                background: #667eea;
                color: white;
            }
            .btn-primary:hover {
                background: #5a6fd8;
                transform: translateY(-2px);
            }
            .btn-warning {
                background: #ffc107;
                color: #333;
            }
            .btn-warning:hover {
                background: #e0a800;
                transform: translateY(-2px);
            }
            .btn-danger {
                background: #dc3545;
                color: white;
            }
            .btn-danger:hover {
                background: #c82333;
                transform: translateY(-2px);
            }
            .search-bar {
                flex: 1;
                min-width: 300px;
            }
            .search-bar input {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #e1e5e9;
                border-radius: 25px;
                font-size: 1rem;
            }
            .search-bar input:focus {
                outline: none;
                border-color: #667eea;
            }
            .table-container {
                background: white;
                border-radius: 20px;
                padding: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                overflow-x: auto;
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            th, td {
                padding: 1rem;
                text-align: left;
                border-bottom: 1px solid #e1e5e9;
            }
            th {
                background: #f8f9fa;
                font-weight: bold;
                color: #333;
            }
            .status-badge {
                padding: 0.25rem 0.75rem;
                border-radius: 15px;
                font-size: 0.9rem;
                font-weight: bold;
            }
            .status-active {
                background: #d4edda;
                color: #155724;
            }
            .status-maintenance {
                background: #fff3cd;
                color: #856404;
            }
            .status-inactive {
                background: #f8d7da;
                color: #721c24;
            }
            .action-buttons {
                display: flex;
                gap: 0.5rem;
            }
            .btn-sm {
                padding: 0.5rem;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1rem;
            }
            .back-btn {
                position: fixed;
                top: 2rem;
                left: 2rem;
                background: rgba(255,255,255,0.9);
                border: 2px solid rgba(255,255,255,0.3);
                color: #333;
                padding: 1rem;
                text-decoration: none;
                border-radius: 50%;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            .back-btn:hover {
                background: white;
                transform: translateY(-2px);
            }
            .home-btn {
                position: fixed;
                top: 2rem;
                right: 2rem;
                background: rgba(102, 126, 234, 0.9);
                border: 2px solid rgba(102, 126, 234, 0.3);
                color: white;
                padding: 1rem;
                text-decoration: none;
                border-radius: 50%;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                z-index: 1000;
            }
            .home-btn:hover {
                background: #667eea;
                transform: translateY(-2px);
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                body {
                    padding: 0.5rem;
                }
                .container {
                    max-width: 100%;
                }
                .header {
                    padding: 1.5rem;
                    margin-bottom: 1rem;
                }
                .header-title {
                    font-size: 1.8rem;
                }
                .actions-bar {
                    flex-direction: column;
                    gap: 1rem;
                }
                .search-bar {
                    min-width: 100%;
                }
                .table-container {
                    padding: 1rem;
                }
                table {
                    font-size: 0.9rem;
                }
                th, td {
                    padding: 0.5rem;
                }
                .action-buttons {
                    flex-direction: column;
                    gap: 0.25rem;
                }
                .btn-sm {
                    width: 35px;
                    height: 35px;
                    font-size: 0.9rem;
                }
                .back-btn, .home-btn {
                    position: relative;
                    top: auto;
                    left: auto;
                    right: auto;
                    margin: 0.5rem;
                    display: inline-block;
                }
            }
            
            @media (max-width: 480px) {
                .header-title {
                    font-size: 1.5rem;
                }
                table {
                    font-size: 0.8rem;
                }
                th, td {
                    padding: 0.25rem;
                }
                .status-badge {
                    font-size: 0.8rem;
                    padding: 0.2rem 0.5rem;
                }
            }
        </style>
    </head>
    <body>
        <a href="/dashboard" class="back-btn">←</a>
        <a href="/dashboard" class="home-btn">🏠</a>
        
        <div class="container">
            <div class="header">
                <div class="header-icon">🚚</div>
                <h1 class="header-title">Gestion des Véhicules</h1>
                <p class="header-subtitle">Gérez l'entretien, le carburant et l'historique complet de vos véhicules</p>
                    </div>
            
            <div class="actions-bar">
                <a href="#" class="btn btn-danger" onclick="showAddForm()">+ Nouveau Véhicule</a>
                <a href="#" class="btn btn-primary" onclick="refreshTable()">🔄 Actualiser</a>
                <a href="#" class="btn btn-warning" onclick="exportData()">📊 Exporter</a>
                <div class="search-bar">
                    <input type="text" placeholder="Rechercher par plaque, marque ou modèle..." onkeyup="filterTable(this.value)">
                    </div>
                </div>
            
            <div class="table-container">
                <table id="vehiclesTable">
                    <thead>
                        <tr>
                            <th>Plaque</th>
                            <th>Marque</th>
                            <th>Modèle</th>
                            <th>Année</th>
                            <th>Couleur</th>
                            <th>Kilométrage</th>
                            <th>Type de carburant</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>ABC-123</td>
                            <td>Toyota</td>
                            <td>Corolla</td>
                            <td>2020</td>
                            <td>Blanc</td>
                            <td>45,000 km</td>
                            <td>Essence</td>
                            <td><span class="status-badge status-active">Actif</span></td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-primary btn-sm" onclick="viewVehicle(1)" title="Voir">👁️</button>
                                    <button class="btn btn-warning btn-sm" onclick="editVehicle(1)" title="Modifier">✏️</button>
                                    <button class="btn btn-danger btn-sm" onclick="deleteVehicle(1)" title="Supprimer">🗑️</button>
            </div>
                            </td>
                        </tr>
                        <tr>
                            <td>XYZ-789</td>
                            <td>Ford</td>
                            <td>Transit</td>
                            <td>2019</td>
                            <td>Bleu</td>
                            <td>78,000 km</td>
                            <td>Diesel</td>
                            <td><span class="status-badge status-maintenance">Maintenance</span></td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-primary btn-sm" onclick="viewVehicle(2)" title="Voir">👁️</button>
                                    <button class="btn btn-warning btn-sm" onclick="editVehicle(2)" title="Modifier">✏️</button>
                                    <button class="btn btn-danger btn-sm" onclick="deleteVehicle(2)" title="Supprimer">🗑️</button>
        </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <script>
            function showAddForm() {
                window.location.href = '/new-vehicle';
            }
            
            function refreshTable() {
                location.reload();
            }
            
            function exportData() {
                alert('Fonctionnalité d\\'export à implémenter');
            }
            
            function filterTable(searchTerm) {
                const table = document.getElementById('vehiclesTable');
                const rows = table.getElementsByTagName('tr');
                
                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i];
                    const text = row.textContent.toLowerCase();
                    if (text.includes(searchTerm.toLowerCase())) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }
            }
            
            function viewVehicle(id) {
                alert('Voir véhicule ID: ' + id);
            }
            
            function editVehicle(id) {
                alert('Modifier véhicule ID: ' + id);
            }
            
            function deleteVehicle(id) {
                if (confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
                    alert('Supprimer véhicule ID: ' + id);
                }
            }
            
            // Charger les véhicules depuis localStorage au chargement de la page
            document.addEventListener('DOMContentLoaded', function() {
                loadVehiclesFromStorage();
            });
            
            function loadVehiclesFromStorage() {
                const vehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
                const tbody = document.querySelector('#vehiclesTable tbody');
                
                // Vider le tbody avant d'ajouter les véhicules
                tbody.innerHTML = '';
                
                // Ajouter les véhicules stockés à la table
                vehicles.forEach(vehicle => {
                    const row = document.createElement('tr');
                    const statusClass = vehicle.status === 'active' ? 'status-active' : 
                                      vehicle.status === 'maintenance' ? 'status-warning' : 'status-inactive';
                    const statusText = vehicle.status === 'active' ? 'Actif' : 
                                     vehicle.status === 'maintenance' ? 'En maintenance' : 'Inactif';
                    
                    row.innerHTML = `
                        <td>${vehicle.plate}</td>
                        <td>${vehicle.brand}</td>
                        <td>${vehicle.model}</td>
                        <td>${vehicle.year}</td>
                        <td>${vehicle.color}</td>
                        <td>${vehicle.mileage} km</td>
                        <td>${vehicle.fuelType}</td>
                        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-primary btn-sm" onclick="viewVehicle(${vehicle.id})" title="Voir">👁️</button>
                                <button class="btn btn-warning btn-sm" onclick="editVehicle(${vehicle.id})" title="Modifier">✏️</button>
                                <button class="btn btn-danger btn-sm" onclick="deleteVehicle(${vehicle.id})" title="Supprimer">🗑️</button>
                            </div>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }
        </script>
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
                padding: 2rem;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
            }
            .header {
                background: white;
                border-radius: 20px;
                padding: 2rem;
                text-align: center;
                margin-bottom: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .header-icon {
                font-size: 3rem;
                color: #667eea;
                margin-bottom: 1rem;
            }
            .header-title {
                color: #333;
                font-size: 2.5rem;
                font-weight: bold;
                margin-bottom: 0.5rem;
            }
            .header-subtitle {
                color: #666;
                font-size: 1.2rem;
            }
            .actions-bar {
                background: white;
                border-radius: 15px;
                padding: 1.5rem;
                margin-bottom: 2rem;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
                align-items: center;
            }
            .btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 25px;
                text-decoration: none;
                font-weight: bold;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            .btn-success {
                background: #28a745;
                color: white;
            }
            .btn-success:hover {
                background: #218838;
                transform: translateY(-2px);
            }
            .btn-primary {
                background: #667eea;
                color: white;
            }
            .btn-primary:hover {
                background: #5a6fd8;
                transform: translateY(-2px);
            }
            .btn-warning {
                background: #ffc107;
                color: #333;
            }
            .btn-warning:hover {
                background: #e0a800;
                transform: translateY(-2px);
            }
            .btn-danger {
                background: #dc3545;
                color: white;
            }
            .btn-danger:hover {
                background: #c82333;
                transform: translateY(-2px);
            }
            .search-bar {
                flex: 1;
                min-width: 300px;
            }
            .search-bar input {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #e1e5e9;
                border-radius: 25px;
                font-size: 1rem;
            }
            .search-bar input:focus {
                outline: none;
                border-color: #667eea;
            }
            .table-container {
                background: white;
                border-radius: 20px;
                padding: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                overflow-x: auto;
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            th, td {
                padding: 1rem;
                text-align: left;
                border-bottom: 1px solid #e1e5e9;
            }
            th {
                background: #f8f9fa;
                font-weight: bold;
                color: #333;
            }
            .status-badge {
                padding: 0.25rem 0.75rem;
                border-radius: 15px;
                font-size: 0.9rem;
                font-weight: bold;
            }
            .status-low {
                background: #f8d7da;
                color: #721c24;
            }
            .status-normal {
                background: #d4edda;
                color: #155724;
            }
            .status-high {
                background: #d1ecf1;
                color: #0c5460;
            }
            .action-buttons {
                display: flex;
                gap: 0.5rem;
            }
            .btn-sm {
                padding: 0.5rem;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1rem;
            }
            .back-btn {
                position: fixed;
                top: 2rem;
                left: 2rem;
                background: rgba(255,255,255,0.9);
                border: 2px solid rgba(255,255,255,0.3);
                color: #333;
                padding: 1rem;
                text-decoration: none;
                border-radius: 50%;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            .back-btn:hover {
                background: white;
                transform: translateY(-2px);
            }
            .home-btn {
                position: fixed;
                top: 2rem;
                right: 2rem;
                background: rgba(102, 126, 234, 0.9);
                border: 2px solid rgba(102, 126, 234, 0.3);
                color: white;
                padding: 1rem;
                text-decoration: none;
                border-radius: 50%;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                z-index: 1000;
            }
            .home-btn:hover {
                background: #667eea;
                transform: translateY(-2px);
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                body {
                    padding: 0.5rem;
                }
                .container {
                    max-width: 100%;
                }
                .header {
                    padding: 1.5rem;
                    margin-bottom: 1rem;
                }
                .header-title {
                    font-size: 1.8rem;
                }
                .actions-bar {
                    flex-direction: column;
                    gap: 1rem;
                }
                .search-bar {
                    min-width: 100%;
                }
                .table-container {
                    padding: 1rem;
                }
                table {
                    font-size: 0.9rem;
                }
                th, td {
                    padding: 0.5rem;
                }
                .action-buttons {
                    flex-direction: column;
                    gap: 0.25rem;
                }
                .btn-sm {
                    width: 35px;
                    height: 35px;
                    font-size: 0.9rem;
                }
                .back-btn, .home-btn {
                    position: relative;
                    top: auto;
                    left: auto;
                    right: auto;
                    margin: 0.5rem;
                    display: inline-block;
                }
            }
            
            @media (max-width: 480px) {
                .header-title {
                    font-size: 1.5rem;
                }
                table {
                    font-size: 0.8rem;
                }
                th, td {
                    padding: 0.25rem;
                }
                .status-badge {
                    font-size: 0.8rem;
                    padding: 0.2rem 0.5rem;
                }
            }
        </style>
    </head>
    <body>
        <a href="/dashboard" class="back-btn">←</a>
        <a href="/dashboard" class="home-btn">🏠</a>
        
        <div class="container">
            <div class="header">
                <div class="header-icon">📦</div>
                <h1 class="header-title">Gestion du Stock</h1>
                <p class="header-subtitle">Contrôlez votre inventaire avec alertes de seuil automatiques</p>
            </div>
            
            <div class="actions-bar">
                <a href="#" class="btn btn-warning" onclick="showAddForm()">+ Ajouter Article</a>
                <a href="#" class="btn btn-primary" onclick="refreshTable()">🔄 Actualiser</a>
                <a href="#" class="btn btn-success" onclick="exportData()">📊 Exporter</a>
                <div class="search-bar">
                    <input type="text" placeholder="Rechercher par nom d'article ou catégorie..." onkeyup="filterTable(this.value)">
                    </div>
                </div>
                
            <div class="table-container">
                <table id="stockTable">
                    <thead>
                        <tr>
                            <th>Article</th>
                            <th>Catégorie</th>
                            <th>Quantité</th>
                            <th>Prix Unitaire</th>
                            <th>Valeur Totale</th>
                            <th>Seuil</th>
                            <th>Emplacement</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Papier A4</td>
                            <td>Bureau</td>
                            <td>50</td>
                            <td>3,5 GNF</td>
                            <td>175 GNF</td>
                            <td>10</td>
                            <td>Armoire A1</td>
                            <td><span class="status-badge status-normal">Normal</span></td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-primary btn-sm" onclick="viewItem(1)" title="Voir">👁️</button>
                                    <button class="btn btn-warning btn-sm" onclick="editItem(1)" title="Modifier">✏️</button>
                                    <button class="btn btn-danger btn-sm" onclick="deleteItem(1)" title="Supprimer">🗑️</button>
                    </div>
                            </td>
                        </tr>
                        <tr>
                            <td>Cartouches d'encre HP</td>
                            <td>Équipement</td>
                            <td>5</td>
                            <td>25 GNF</td>
                            <td>125 GNF</td>
                            <td>2</td>
                            <td>Bureau principal</td>
                            <td><span class="status-badge status-high">Élevé</span></td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-primary btn-sm" onclick="viewItem(2)" title="Voir">👁️</button>
                                    <button class="btn btn-warning btn-sm" onclick="editItem(2)" title="Modifier">✏️</button>
                                    <button class="btn btn-danger btn-sm" onclick="deleteItem(2)" title="Supprimer">🗑️</button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>Essence</td>
                            <td>Carburant</td>
                            <td>200</td>
                            <td>1,5 GNF</td>
                            <td>300 GNF</td>
                            <td>50</td>
                            <td>Station service</td>
                            <td><span class="status-badge status-normal">Normal</span></td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-primary btn-sm" onclick="viewItem(3)" title="Voir">👁️</button>
                                    <button class="btn btn-warning btn-sm" onclick="editItem(3)" title="Modifier">✏️</button>
                                    <button class="btn btn-danger btn-sm" onclick="deleteItem(3)" title="Supprimer">🗑️</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
                </div>
                
        <script>
            function showAddForm() {
                alert('Fonctionnalité d\\'ajout d\\'article à implémenter');
            }
            
            function refreshTable() {
                location.reload();
            }
            
            function exportData() {
                alert('Fonctionnalité d\\'export à implémenter');
            }
            
            function filterTable(searchTerm) {
                const table = document.getElementById('stockTable');
                const rows = table.getElementsByTagName('tr');
                
                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i];
                    const text = row.textContent.toLowerCase();
                    if (text.includes(searchTerm.toLowerCase())) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }
            }
            
            function viewItem(id) {
                alert('Voir article ID: ' + id);
            }
            
            function editItem(id) {
                alert('Modifier article ID: ' + id);
            }
            
            function deleteItem(id) {
                if (confirm('Êtes-vous sûr de vouloir supprimer cet article ?')) {
                    alert('Supprimer article ID: ' + id);
                }
            }
        </script>
    </body>
    </html>
    """

# Route gestion des rapports
@app.get("/reports", response_class=HTMLResponse)
async def reports_management():
    """Interface de gestion des rapports"""
    return """
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rapports & Analytics - Système de Gestion</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 2rem;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
            }
            .header {
                background: white;
                border-radius: 20px;
                padding: 2rem;
                text-align: center;
                margin-bottom: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .header-icon {
                font-size: 3rem;
                color: #667eea;
                margin-bottom: 1rem;
            }
            .header-title {
                color: #333;
                font-size: 2.5rem;
                font-weight: bold;
                margin-bottom: 0.5rem;
            }
            .header-subtitle {
                color: #666;
                font-size: 1.2rem;
            }
            .actions-bar {
                background: white;
                border-radius: 15px;
                padding: 1.5rem;
                margin-bottom: 2rem;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
                align-items: center;
            }
            .btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 25px;
                text-decoration: none;
                font-weight: bold;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            .btn-success {
                background: #28a745;
                color: white;
            }
            .btn-success:hover {
                background: #218838;
                transform: translateY(-2px);
            }
            .btn-primary {
                background: #667eea;
                color: white;
            }
            .btn-primary:hover {
                background: #5a6fd8;
                transform: translateY(-2px);
            }
            .btn-warning {
                background: #ffc107;
                color: #333;
            }
            .btn-warning:hover {
                background: #e0a800;
                transform: translateY(-2px);
            }
            .btn-danger {
                background: #dc3545;
                color: white;
            }
            .btn-danger:hover {
                background: #c82333;
                transform: translateY(-2px);
            }
            .search-bar {
                flex: 1;
                min-width: 300px;
            }
            .search-bar input {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #e1e5e9;
                border-radius: 25px;
                font-size: 1rem;
            }
            .search-bar input:focus {
                outline: none;
                border-color: #667eea;
            }
            .table-container {
                background: white;
                border-radius: 20px;
                padding: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                overflow-x: auto;
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            th, td {
                padding: 1rem;
                text-align: left;
                border-bottom: 1px solid #e1e5e9;
            }
            th {
                background: #f8f9fa;
                font-weight: bold;
                color: #333;
            }
            .status-badge {
                padding: 0.25rem 0.75rem;
                border-radius: 15px;
                font-size: 0.9rem;
                font-weight: bold;
            }
            .status-completed {
                background: #d4edda;
                color: #155724;
            }
            .status-pending {
                background: #fff3cd;
                color: #856404;
            }
            .status-processing {
                background: #d1ecf1;
                color: #0c5460;
            }
            .action-buttons {
                display: flex;
                gap: 0.5rem;
            }
            .btn-sm {
                padding: 0.5rem;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1rem;
            }
            .back-btn {
                position: fixed;
                top: 2rem;
                left: 2rem;
                background: rgba(255,255,255,0.9);
                border: 2px solid rgba(255,255,255,0.3);
                color: #333;
                padding: 1rem;
                text-decoration: none;
                border-radius: 50%;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            .back-btn:hover {
                background: white;
                transform: translateY(-2px);
            }
            .home-btn {
                position: fixed;
                top: 2rem;
                right: 2rem;
                background: rgba(102, 126, 234, 0.9);
                border: 2px solid rgba(102, 126, 234, 0.3);
                color: white;
                padding: 1rem;
                text-decoration: none;
                border-radius: 50%;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                z-index: 1000;
            }
            .home-btn:hover {
                background: #667eea;
                transform: translateY(-2px);
            }
        </style>
    </head>
    <body>
        <a href="/dashboard" class="back-btn">←</a>
        <a href="/dashboard" class="home-btn">🏠</a>
        
        <div class="container">
            <div class="header">
                <div class="header-icon">📊</div>
                <h1 class="header-title">Rapports & Analytics</h1>
                <p class="header-subtitle">Tableaux de bord interactifs, rapports financiers détaillés et analyses prédictives</p>
                    </div>
            
            <div class="actions-bar">
                <a href="#" class="btn btn-success" onclick="showAddForm()">+ Nouveau Rapport</a>
                <a href="#" class="btn btn-primary" onclick="refreshTable()">🔄 Actualiser</a>
                <a href="#" class="btn btn-warning" onclick="exportData()">📊 Exporter</a>
                <div class="search-bar">
                    <input type="text" placeholder="Rechercher par nom de rapport ou type..." onkeyup="filterTable(this.value)">
                </div>
            </div>
            
            <div class="table-container">
                <table id="reportsTable">
                    <thead>
                        <tr>
                            <th>Nom du Rapport</th>
                            <th>Type</th>
                            <th>Période</th>
                            <th>Date de Création</th>
                            <th>Statut</th>
                            <th>Taille</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Rapport Mensuel Achats</td>
                            <td>Financier</td>
                            <td>Septembre 2024</td>
                            <td>25/09/2024</td>
                            <td><span class="status-badge status-completed">Terminé</span></td>
                            <td>2.3 MB</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-primary btn-sm" onclick="viewReport(1)" title="Voir">👁️</button>
                                    <button class="btn btn-warning btn-sm" onclick="editReport(1)" title="Modifier">✏️</button>
                                    <button class="btn btn-danger btn-sm" onclick="deleteReport(1)" title="Supprimer">🗑️</button>
            </div>
                            </td>
                        </tr>
                        <tr>
                            <td>Analyse Stock Bas</td>
                            <td>Inventaire</td>
                            <td>Septembre 2024</td>
                            <td>24/09/2024</td>
                            <td><span class="status-badge status-pending">En attente</span></td>
                            <td>1.1 MB</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-primary btn-sm" onclick="viewReport(2)" title="Voir">👁️</button>
                                    <button class="btn btn-warning btn-sm" onclick="editReport(2)" title="Modifier">✏️</button>
                                    <button class="btn btn-danger btn-sm" onclick="deleteReport(2)" title="Supprimer">🗑️</button>
        </div>
                            </td>
                        </tr>
                        <tr>
                            <td>Coûts Véhicules</td>
                            <td>Logistique</td>
                            <td>Q3 2024</td>
                            <td>23/09/2024</td>
                            <td><span class="status-badge status-processing">En cours</span></td>
                            <td>0.8 MB</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-primary btn-sm" onclick="viewReport(3)" title="Voir">👁️</button>
                                    <button class="btn btn-warning btn-sm" onclick="editReport(3)" title="Modifier">✏️</button>
                                    <button class="btn btn-danger btn-sm" onclick="deleteReport(3)" title="Supprimer">🗑️</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <script>
            function showAddForm() {
                alert('Fonctionnalité d\\'ajout de rapport à implémenter');
            }
            
            function refreshTable() {
                location.reload();
            }
            
            function exportData() {
                alert('Fonctionnalité d\\'export à implémenter');
            }
            
            function filterTable(searchTerm) {
                const table = document.getElementById('reportsTable');
                const rows = table.getElementsByTagName('tr');
                
                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i];
                    const text = row.textContent.toLowerCase();
                    if (text.includes(searchTerm.toLowerCase())) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }
            }
            
            function viewReport(id) {
                alert('Voir rapport ID: ' + id);
            }
            
            function editReport(id) {
                alert('Modifier rapport ID: ' + id);
            }
            
            function deleteReport(id) {
                if (confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
                    alert('Supprimer rapport ID: ' + id);
                }
            }
        </script>
    </body>
    </html>
    """

# Route gestion des services
@app.get("/services", response_class=HTMLResponse)
async def services_management():
    """Interface de gestion des services"""
    return """
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gestion des Services - Système de Gestion</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 2rem;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
            }
            .header {
                background: white;
                border-radius: 20px;
                padding: 2rem;
                text-align: center;
                margin-bottom: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .header-icon {
                font-size: 3rem;
                color: #667eea;
                margin-bottom: 1rem;
            }
            .header-title {
                color: #333;
                font-size: 2.5rem;
                font-weight: bold;
                margin-bottom: 0.5rem;
            }
            .header-subtitle {
                color: #666;
                font-size: 1.2rem;
            }
            .actions-bar {
                background: white;
                border-radius: 15px;
                padding: 1.5rem;
                margin-bottom: 2rem;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
                align-items: center;
            }
            .btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 25px;
                text-decoration: none;
                font-weight: bold;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            .btn-success {
                background: #28a745;
                color: white;
            }
            .btn-success:hover {
                background: #218838;
                transform: translateY(-2px);
            }
            .btn-primary {
                background: #667eea;
                color: white;
            }
            .btn-primary:hover {
                background: #5a6fd8;
                transform: translateY(-2px);
            }
            .btn-warning {
                background: #ffc107;
                color: #333;
            }
            .btn-warning:hover {
                background: #e0a800;
                transform: translateY(-2px);
            }
            .btn-danger {
                background: #dc3545;
                color: white;
            }
            .btn-danger:hover {
                background: #c82333;
                transform: translateY(-2px);
            }
            .search-bar {
                flex: 1;
                min-width: 300px;
            }
            .search-bar input {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #e1e5e9;
                border-radius: 25px;
                font-size: 1rem;
            }
            .search-bar input:focus {
                outline: none;
                border-color: #667eea;
            }
            .table-container {
                background: white;
                border-radius: 20px;
                padding: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                overflow-x: auto;
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            th, td {
                padding: 1rem;
                text-align: left;
                border-bottom: 1px solid #e1e5e9;
            }
            th {
                background: #f8f9fa;
                font-weight: bold;
                color: #333;
            }
            .status-badge {
                padding: 0.25rem 0.75rem;
                border-radius: 15px;
                font-size: 0.9rem;
                font-weight: bold;
            }
            .status-active {
                background: #d4edda;
                color: #155724;
            }
            .status-inactive {
                background: #f8d7da;
                color: #721c24;
            }
            .action-buttons {
                display: flex;
                gap: 0.5rem;
            }
            .btn-sm {
                padding: 0.5rem;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1rem;
            }
            .back-btn {
                position: fixed;
                top: 2rem;
                left: 2rem;
                background: rgba(255,255,255,0.9);
                border: 2px solid rgba(255,255,255,0.3);
                color: #333;
                padding: 1rem;
                text-decoration: none;
                border-radius: 50%;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            .back-btn:hover {
                background: white;
                transform: translateY(-2px);
            }
            .home-btn {
                position: fixed;
                top: 2rem;
                right: 2rem;
                background: rgba(102, 126, 234, 0.9);
                border: 2px solid rgba(102, 126, 234, 0.3);
                color: white;
                padding: 1rem;
                text-decoration: none;
                border-radius: 50%;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                z-index: 1000;
            }
            .home-btn:hover {
                background: #667eea;
                transform: translateY(-2px);
            }
        </style>
    </head>
    <body>
        <a href="/dashboard" class="back-btn">←</a>
        <a href="/dashboard" class="home-btn">🏠</a>
        
        <div class="container">
            <div class="header">
                <div class="header-icon">🏢</div>
                <h1 class="header-title">Gestion des Services</h1>
                <p class="header-subtitle">Gérez les services de votre organisation</p>
            </div>
            
            <div class="actions-bar">
                <a href="#" class="btn btn-success" onclick="showAddForm()">+ Nouveau Service</a>
                <a href="#" class="btn btn-primary" onclick="refreshTable()">🔄 Actualiser</a>
                <a href="#" class="btn btn-warning" onclick="exportData()">📊 Exporter</a>
                <div class="search-bar">
                    <input type="text" placeholder="Rechercher par nom de service..." onkeyup="filterTable(this.value)">
                </div>
            </div>
            
            <div class="table-container">
                <table id="servicesTable">
                    <thead>
                        <tr>
                            <th>Nom du Service</th>
                            <th>Description</th>
                            <th>Responsable</th>
                            <th>Email</th>
                            <th>Téléphone</th>
                            <th>Statut</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Ressources Humaines</td>
                            <td>Gestion du personnel et des ressources humaines</td>
                            <td>Mme Diallo</td>
                            <td>rh@entreprise.com</td>
                            <td>+224 123 456 789</td>
                            <td><span class="status-badge status-active">Actif</span></td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-primary btn-sm" onclick="viewService(1)" title="Voir">👁️</button>
                                    <button class="btn btn-warning btn-sm" onclick="editService(1)" title="Modifier">✏️</button>
                                    <button class="btn btn-danger btn-sm" onclick="deleteService(1)" title="Supprimer">🗑️</button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>Informatique</td>
                            <td>Gestion des systèmes informatiques</td>
                            <td>M. Bah</td>
                            <td>it@entreprise.com</td>
                            <td>+224 987 654 321</td>
                            <td><span class="status-badge status-active">Actif</span></td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-primary btn-sm" onclick="viewService(2)" title="Voir">👁️</button>
                                    <button class="btn btn-warning btn-sm" onclick="editService(2)" title="Modifier">✏️</button>
                                    <button class="btn btn-danger btn-sm" onclick="deleteService(2)" title="Supprimer">🗑️</button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>Maintenance</td>
                            <td>Entretien et maintenance des équipements</td>
                            <td>M. Camara</td>
                            <td>maintenance@entreprise.com</td>
                            <td>+224 555 123 456</td>
                            <td><span class="status-badge status-active">Actif</span></td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-primary btn-sm" onclick="viewService(3)" title="Voir">👁️</button>
                                    <button class="btn btn-warning btn-sm" onclick="editService(3)" title="Modifier">✏️</button>
                                    <button class="btn btn-danger btn-sm" onclick="deleteService(3)" title="Supprimer">🗑️</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <script>
            function showAddForm() {
                window.location.href = '/new-service';
            }
            
            function refreshTable() {
                location.reload();
            }
            
            function exportData() {
                alert('Fonctionnalité d\\'export à implémenter');
            }
            
            function filterTable(searchTerm) {
                const table = document.getElementById('servicesTable');
                const rows = table.getElementsByTagName('tr');
                
                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i];
                    const text = row.textContent.toLowerCase();
                    if (text.includes(searchTerm.toLowerCase())) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }
            }
            
            function viewService(id) {
                alert('Voir service ID: ' + id);
            }
            
            function editService(id) {
                alert('Modifier service ID: ' + id);
            }
            
            function deleteService(id) {
                if (confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
                    alert('Supprimer service ID: ' + id);
                }
            }
        </script>
    </body>
    </html>
    """

# Route gestion des prestataires
@app.get("/service-providers", response_class=HTMLResponse)
async def service_providers_management():
    """Interface de gestion des prestataires de service"""
    return """
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gestion des Prestataires - Système de Gestion</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 2rem;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
            }
            .header {
                background: white;
                border-radius: 20px;
                padding: 2rem;
                text-align: center;
                margin-bottom: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .header-icon {
                font-size: 3rem;
                color: #667eea;
                margin-bottom: 1rem;
            }
            .header-title {
                color: #333;
                font-size: 2.5rem;
                font-weight: bold;
                margin-bottom: 0.5rem;
            }
            .header-subtitle {
                color: #666;
                font-size: 1.2rem;
            }
            .actions-bar {
                background: white;
                border-radius: 15px;
                padding: 1.5rem;
                margin-bottom: 2rem;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
                align-items: center;
            }
            .btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 25px;
                text-decoration: none;
                font-weight: bold;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            .btn-success {
                background: #28a745;
                color: white;
            }
            .btn-success:hover {
                background: #218838;
                transform: translateY(-2px);
            }
            .btn-primary {
                background: #667eea;
                color: white;
            }
            .btn-primary:hover {
                background: #5a6fd8;
                transform: translateY(-2px);
            }
            .btn-warning {
                background: #ffc107;
                color: #333;
            }
            .btn-warning:hover {
                background: #e0a800;
                transform: translateY(-2px);
            }
            .btn-danger {
                background: #dc3545;
                color: white;
            }
            .btn-danger:hover {
                background: #c82333;
                transform: translateY(-2px);
            }
            .search-bar {
                flex: 1;
                min-width: 300px;
            }
            .search-bar input {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #e1e5e9;
                border-radius: 25px;
                font-size: 1rem;
            }
            .search-bar input:focus {
                outline: none;
                border-color: #667eea;
            }
            .table-container {
                background: white;
                border-radius: 20px;
                padding: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                overflow-x: auto;
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            th, td {
                padding: 1rem;
                text-align: left;
                border-bottom: 1px solid #e1e5e9;
            }
            th {
                background: #f8f9fa;
                font-weight: bold;
                color: #333;
            }
            .rating {
                color: #ffc107;
                font-size: 1.2rem;
            }
            .action-buttons {
                display: flex;
                gap: 0.5rem;
            }
            .btn-sm {
                padding: 0.5rem;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1rem;
            }
            .back-btn {
                position: fixed;
                top: 2rem;
                left: 2rem;
                background: rgba(255,255,255,0.9);
                border: 2px solid rgba(255,255,255,0.3);
                color: #333;
                padding: 1rem;
                text-decoration: none;
                border-radius: 50%;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            .back-btn:hover {
                background: white;
                transform: translateY(-2px);
            }
            .home-btn {
                position: fixed;
                top: 2rem;
                right: 2rem;
                background: rgba(102, 126, 234, 0.9);
                border: 2px solid rgba(102, 126, 234, 0.3);
                color: white;
                padding: 1rem;
                text-decoration: none;
                border-radius: 50%;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                z-index: 1000;
            }
            .home-btn:hover {
                background: #667eea;
                transform: translateY(-2px);
            }
        </style>
    </head>
    <body>
        <a href="/dashboard" class="back-btn">←</a>
        <a href="/dashboard" class="home-btn">🏠</a>
        
        <div class="container">
            <div class="header">
                <div class="header-icon">🔧</div>
                <h1 class="header-title">Gestion des Prestataires</h1>
                <p class="header-subtitle">Gérez vos prestataires de services externes</p>
            </div>
            
            <div class="actions-bar">
                <a href="#" class="btn btn-success" onclick="showAddForm()">+ Nouveau Prestataire</a>
                <a href="#" class="btn btn-primary" onclick="refreshTable()">🔄 Actualiser</a>
                <a href="#" class="btn btn-warning" onclick="exportData()">📊 Exporter</a>
                <div class="search-bar">
                    <input type="text" placeholder="Rechercher par nom ou type de service..." onkeyup="filterTable(this.value)">
                </div>
            </div>
            
            <div class="table-container">
                <table id="providersTable">
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Type de Service</th>
                            <th>Spécialisation</th>
                            <th>Contact</th>
                            <th>Téléphone</th>
                            <th>Note</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Garage Central</td>
                            <td>Mécanique</td>
                            <td>Moteur et transmission</td>
                            <td>M. Bah</td>
                            <td>+224 123 456 789</td>
                            <td><span class="rating">★★★★☆</span> 4.5</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-primary btn-sm" onclick="viewProvider(1)" title="Voir">👁️</button>
                                    <button class="btn btn-warning btn-sm" onclick="editProvider(1)" title="Modifier">✏️</button>
                                    <button class="btn btn-danger btn-sm" onclick="deleteProvider(1)" title="Supprimer">🗑️</button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>Carrosserie Moderne</td>
                            <td>Carrosserie</td>
                            <td>Réparation et peinture</td>
                            <td>Mme. Diallo</td>
                            <td>+224 987 654 321</td>
                            <td><span class="rating">★★★★☆</span> 4.2</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-primary btn-sm" onclick="viewProvider(2)" title="Voir">👁️</button>
                                    <button class="btn btn-warning btn-sm" onclick="editProvider(2)" title="Modifier">✏️</button>
                                    <button class="btn btn-danger btn-sm" onclick="deleteProvider(2)" title="Supprimer">🗑️</button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>Électricité Auto</td>
                            <td>Électricité</td>
                            <td>Diagnostic et réparation</td>
                            <td>M. Camara</td>
                            <td>+224 555 123 456</td>
                            <td><span class="rating">★★★★☆</span> 4.0</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-primary btn-sm" onclick="viewProvider(3)" title="Voir">👁️</button>
                                    <button class="btn btn-warning btn-sm" onclick="editProvider(3)" title="Modifier">✏️</button>
                                    <button class="btn btn-danger btn-sm" onclick="deleteProvider(3)" title="Supprimer">🗑️</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <script>
            function showAddForm() {
                alert('Fonctionnalité d\\'ajout de prestataire à implémenter');
            }
            
            function refreshTable() {
                location.reload();
            }
            
            function exportData() {
                alert('Fonctionnalité d\\'export à implémenter');
            }
            
            function filterTable(searchTerm) {
                const table = document.getElementById('providersTable');
                const rows = table.getElementsByTagName('tr');
                
                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i];
                    const text = row.textContent.toLowerCase();
                    if (text.includes(searchTerm.toLowerCase())) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }
            }
            
            function viewProvider(id) {
                alert('Voir prestataire ID: ' + id);
            }
            
            function editProvider(id) {
                alert('Modifier prestataire ID: ' + id);
            }
            
            function deleteProvider(id) {
                if (confirm('Êtes-vous sûr de vouloir supprimer ce prestataire ?')) {
                    alert('Supprimer prestataire ID: ' + id);
                }
            }
        </script>
    </body>
    </html>
    """

# Route gestion des fournisseurs
@app.get("/suppliers", response_class=HTMLResponse)
async def suppliers_management():
    """Interface de gestion des fournisseurs"""
    return """
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gestion des Fournisseurs - Système de Gestion</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 2rem;
            }
            .container {
                max-width: 1200px;
                margin: 0 auto;
            }
            .header {
                background: white;
                border-radius: 20px;
                padding: 2rem;
                text-align: center;
                margin-bottom: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .header-icon {
                font-size: 3rem;
                color: #667eea;
                margin-bottom: 1rem;
            }
            .header-title {
                color: #333;
                font-size: 2.5rem;
                font-weight: bold;
                margin-bottom: 0.5rem;
            }
            .header-subtitle {
                color: #666;
                font-size: 1.2rem;
            }
            .actions-bar {
                background: white;
                border-radius: 15px;
                padding: 1.5rem;
                margin-bottom: 2rem;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
                align-items: center;
            }
            .btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 25px;
                text-decoration: none;
                font-weight: bold;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            .btn-success {
                background: #28a745;
                color: white;
            }
            .btn-success:hover {
                background: #218838;
                transform: translateY(-2px);
            }
            .btn-primary {
                background: #667eea;
                color: white;
            }
            .btn-primary:hover {
                background: #5a6fd8;
                transform: translateY(-2px);
            }
            .btn-warning {
                background: #ffc107;
                color: #333;
            }
            .btn-warning:hover {
                background: #e0a800;
                transform: translateY(-2px);
            }
            .btn-danger {
                background: #dc3545;
                color: white;
            }
            .btn-danger:hover {
                background: #c82333;
                transform: translateY(-2px);
            }
            .search-bar {
                flex: 1;
                min-width: 300px;
            }
            .search-bar input {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #e1e5e9;
                border-radius: 25px;
                font-size: 1rem;
            }
            .search-bar input:focus {
                outline: none;
                border-color: #667eea;
            }
            .table-container {
                background: white;
                border-radius: 20px;
                padding: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                overflow-x: auto;
            }
            table {
                width: 100%;
                border-collapse: collapse;
            }
            th, td {
                padding: 1rem;
                text-align: left;
                border-bottom: 1px solid #e1e5e9;
            }
            th {
                background: #f8f9fa;
                font-weight: bold;
                color: #333;
            }
            .action-buttons {
                display: flex;
                gap: 0.5rem;
            }
            .btn-sm {
                padding: 0.5rem;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1rem;
            }
            .back-btn {
                position: fixed;
                top: 2rem;
                left: 2rem;
                background: rgba(255,255,255,0.9);
                border: 2px solid rgba(255,255,255,0.3);
                color: #333;
                padding: 1rem;
                text-decoration: none;
                border-radius: 50%;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            .back-btn:hover {
                background: white;
                transform: translateY(-2px);
            }
            .home-btn {
                position: fixed;
                top: 2rem;
                right: 2rem;
                background: rgba(102, 126, 234, 0.9);
                border: 2px solid rgba(102, 126, 234, 0.3);
                color: white;
                padding: 1rem;
                text-decoration: none;
                border-radius: 50%;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                z-index: 1000;
            }
            .home-btn:hover {
                background: #667eea;
                transform: translateY(-2px);
            }
        </style>
    </head>
    <body>
        <a href="/dashboard" class="back-btn">←</a>
        <a href="/dashboard" class="home-btn">🏠</a>
        
        <div class="container">
            <div class="header">
                <div class="header-icon">🏪</div>
                <h1 class="header-title">Gestion des Fournisseurs</h1>
                <p class="header-subtitle">Gérez vos fournisseurs et partenaires commerciaux</p>
            </div>
            
            <div class="actions-bar">
                <a href="#" class="btn btn-success" onclick="showAddForm()">+ Nouveau Fournisseur</a>
                <a href="#" class="btn btn-primary" onclick="refreshTable()">🔄 Actualiser</a>
                <a href="#" class="btn btn-warning" onclick="exportData()">📊 Exporter</a>
                <div class="search-bar">
                    <input type="text" placeholder="Rechercher par nom de fournisseur..." onkeyup="filterTable(this.value)">
                    </div>
                </div>
                
            <div class="table-container">
                <table id="suppliersTable">
                    <thead>
                        <tr>
                            <th>Nom</th>
                            <th>Contact</th>
                            <th>Email</th>
                            <th>Téléphone</th>
                            <th>Adresse</th>
                            <th>Conditions de Paiement</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Fournisseur Général</td>
                            <td>M. Diallo</td>
                            <td>contact@fournisseur-gn.com</td>
                            <td>+224 123 456 789</td>
                            <td>Quartier Almamya, Conakry</td>
                            <td>30 jours</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-primary btn-sm" onclick="viewSupplier(1)" title="Voir">👁️</button>
                                    <button class="btn btn-warning btn-sm" onclick="editSupplier(1)" title="Modifier">✏️</button>
                                    <button class="btn btn-danger btn-sm" onclick="deleteSupplier(1)" title="Supprimer">🗑️</button>
                    </div>
                            </td>
                        </tr>
                        <tr>
                            <td>Équipements Bureau</td>
                            <td>Mme Camara</td>
                            <td>bureau@equipements.com</td>
                            <td>+224 987 654 321</td>
                            <td>Centre-ville, Conakry</td>
                            <td>15 jours</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-primary btn-sm" onclick="viewSupplier(2)" title="Voir">👁️</button>
                                    <button class="btn btn-warning btn-sm" onclick="editSupplier(2)" title="Modifier">✏️</button>
                                    <button class="btn btn-danger btn-sm" onclick="deleteSupplier(2)" title="Supprimer">🗑️</button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>Station Service Total</td>
                            <td>M. Bah</td>
                            <td>total@station.com</td>
                            <td>+224 555 123 456</td>
                            <td>Route du Niger, Conakry</td>
                            <td>Paiement comptant</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn btn-primary btn-sm" onclick="viewSupplier(3)" title="Voir">👁️</button>
                                    <button class="btn btn-warning btn-sm" onclick="editSupplier(3)" title="Modifier">✏️</button>
                                    <button class="btn btn-danger btn-sm" onclick="deleteSupplier(3)" title="Supprimer">🗑️</button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
                </div>
                
        <script>
            function showAddForm() {
                window.location.href = '/new-supplier';
            }
            
            function refreshTable() {
                location.reload();
            }
            
            function exportData() {
                alert('Fonctionnalité d\\'export à implémenter');
            }
            
            function filterTable(searchTerm) {
                const table = document.getElementById('suppliersTable');
                const rows = table.getElementsByTagName('tr');
                
                for (let i = 1; i < rows.length; i++) {
                    const row = rows[i];
                    const text = row.textContent.toLowerCase();
                    if (text.includes(searchTerm.toLowerCase())) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }
            }
            
            function viewSupplier(id) {
                alert('Voir fournisseur ID: ' + id);
            }
            
            function editSupplier(id) {
                alert('Modifier fournisseur ID: ' + id);
            }
            
            function deleteSupplier(id) {
                if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
                    alert('Supprimer fournisseur ID: ' + id);
                }
            }
        </script>
    </body>
    </html>
    """

# Route page d'approbation avec signature
@app.get("/approval/{request_id}", response_class=HTMLResponse)
async def approval_page(request_id: int):
    """Page d'approbation avec signature et commentaire"""
    return f"""
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Approbation Demande - Système de Gestion</title>
        <style>
            * {{ margin: 0; padding: 0; box-sizing: border-box; }}
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 2rem;
            }}
            .container {{
                max-width: 800px;
                margin: 0 auto;
            }}
            .header {{
                background: white;
                border-radius: 20px;
                padding: 2rem;
                text-align: center;
                margin-bottom: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }}
            .header-icon {{
                font-size: 3rem;
                color: #667eea;
                margin-bottom: 1rem;
            }}
            .header-title {{
                color: #333;
                font-size: 2.5rem;
                font-weight: bold;
                margin-bottom: 0.5rem;
            }}
            .request-details {{
                background: white;
                border-radius: 20px;
                padding: 2rem;
                margin-bottom: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }}
            .detail-row {{
                display: flex;
                justify-content: space-between;
                padding: 0.75rem 0;
                border-bottom: 1px solid #e1e5e9;
            }}
            .detail-row:last-child {{
                border-bottom: none;
            }}
            .detail-label {{
                font-weight: bold;
                color: #333;
            }}
            .detail-value {{
                color: #666;
            }}
            .approval-form {{
                background: white;
                border-radius: 20px;
                padding: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }}
            .form-group {{
                margin-bottom: 1.5rem;
            }}
            .form-label {{
                display: block;
                margin-bottom: 0.5rem;
                font-weight: bold;
                color: #333;
            }}
            .form-input {{
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #e1e5e9;
                border-radius: 10px;
                font-size: 1rem;
            }}
            .form-input:focus {{
                outline: none;
                border-color: #667eea;
            }}
            .form-textarea {{
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #e1e5e9;
                border-radius: 10px;
                font-size: 1rem;
                min-height: 100px;
                resize: vertical;
            }}
            .form-textarea:focus {{
                outline: none;
                border-color: #667eea;
            }}
            .signature-pad {{
                border: 2px solid #e1e5e9;
                border-radius: 10px;
                background: white;
                cursor: crosshair;
            }}
            .btn {{
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 25px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-right: 1rem;
            }}
            .btn-success {{
                background: #28a745;
                color: white;
            }}
            .btn-success:hover {{
                background: #218838;
                transform: translateY(-2px);
            }}
            .btn-danger {{
                background: #dc3545;
                color: white;
            }}
            .btn-danger:hover {{
                background: #c82333;
                transform: translateY(-2px);
            }}
            .btn-secondary {{
                background: #6c757d;
                color: white;
            }}
            .btn-secondary:hover {{
                background: #5a6268;
                transform: translateY(-2px);
            }}
            .back-btn {{
                position: fixed;
                top: 2rem;
                left: 2rem;
                background: rgba(255,255,255,0.9);
                border: 2px solid rgba(255,255,255,0.3);
                color: #333;
                padding: 1rem;
                text-decoration: none;
                border-radius: 50%;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }}
            .back-btn:hover {{
                background: white;
                transform: translateY(-2px);
            }}
            
            /* Modal Styles */
            .modal {{
                display: none;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.5);
                backdrop-filter: blur(5px);
            }}
            
            .modal-content {{
                background-color: white;
                margin: 15% auto;
                padding: 2rem;
                border-radius: 20px;
                width: 90%;
                max-width: 500px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                text-align: center;
                animation: modalSlideIn 0.3s ease-out;
            }}
            
            @keyframes modalSlideIn {{
                from {{
                    opacity: 0;
                    transform: translateY(-50px);
                }}
                to {{
                    opacity: 1;
                    transform: translateY(0);
                }}
            }}
            
            .modal-header {{
                margin-bottom: 1rem;
            }}
            
            .modal-icon {{
                font-size: 3rem;
                margin-bottom: 1rem;
            }}
            
            .modal-title {{
                font-size: 1.5rem;
                font-weight: bold;
                margin-bottom: 1rem;
            }}
            
            .modal-message {{
                font-size: 1rem;
                line-height: 1.6;
                margin-bottom: 2rem;
                color: #666;
            }}
            
            .modal-buttons {{
                display: flex;
                gap: 1rem;
                justify-content: center;
            }}
            
            .modal-btn {{
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 25px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 120px;
            }}
            
            .modal-btn-primary {{
                background: #667eea;
                color: white;
            }}
            
            .modal-btn-primary:hover {{
                background: #5a6fd8;
                transform: translateY(-2px);
            }}
            
            .modal-btn-secondary {{
                background: #6c757d;
                color: white;
            }}
            
            .modal-btn-secondary:hover {{
                background: #5a6268;
                transform: translateY(-2px);
            }}
            
            .modal-btn-success {{
                background: #28a745;
                color: white;
            }}
            
            .modal-btn-success:hover {{
                background: #218838;
                transform: translateY(-2px);
            }}
            
            .modal-btn-danger {{
                background: #dc3545;
                color: white;
            }}
            
            .modal-btn-danger:hover {{
                background: #c82333;
                transform: translateY(-2px);
            }}
            
            .close {{
                color: #aaa;
                float: right;
                font-size: 28px;
                font-weight: bold;
                cursor: pointer;
                position: absolute;
                right: 1rem;
                top: 1rem;
            }}
            
            .close:hover {{
                color: #000;
            }}
        </style>
    </head>
    <body>
        <a href="/purchase-requests" class="back-btn">←</a>
        <a href="/dashboard" class="home-btn">🏠</a>
        
        <div class="container">
            <div class="header">
                <div class="header-icon">✍️</div>
                <h1 class="header-title">Approbation de Demande</h1>
                <p class="header-subtitle">Validez ou rejetez la demande d'achat</p>
                    </div>
            
            <div class="request-details">
                <h3 style="margin-bottom: 1rem; color: #333;">Détails de la Demande</h3>
                <div class="detail-row">
                    <span class="detail-label">N° Demande:</span>
                    <span class="detail-value">DEM-20240925-{request_id:03d}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Service Demandeur:</span>
                    <span class="detail-value">Ressources Humaines</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Article:</span>
                    <span class="detail-value">Papier A4</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Quantité:</span>
                    <span class="detail-value">10 paquets</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Prix Estimé:</span>
                    <span class="detail-value">35 GNF</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date Demande:</span>
                    <span class="detail-value">25/09/2024</span>
                </div>
            </div>
            
            <div class="approval-form">
                <h3 style="margin-bottom: 1rem; color: #333;">Formulaire d'Approbation</h3>
                
                <div class="form-group">
                    <label class="form-label">Commentaire (optionnel):</label>
                    <textarea class="form-textarea" id="comment" placeholder="Ajoutez un commentaire sur votre décision..."></textarea>
            </div>
                
                <div class="form-group">
                    <label class="form-label">Signature:</label>
                    <canvas id="signaturePad" class="signature-pad" width="600" height="200"></canvas>
                    <button type="button" onclick="clearSignature()" style="margin-top: 0.5rem; padding: 0.5rem 1rem; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">Effacer</button>
        </div>
                
                <div style="text-align: center; margin-top: 2rem;">
                    <button class="btn btn-success" onclick="approveRequest({request_id})">✓ Approuver</button>
                    <button class="btn btn-danger" onclick="rejectRequest({request_id})">✗ Rejeter</button>
                    <button class="btn btn-secondary" onclick="goBack()">Annuler</button>
                </div>
            </div>
        </div>
        
        <script>
            // Attendre que le DOM soit chargé
            document.addEventListener('DOMContentLoaded', function() {{
                // Variable pour suivre si une signature a été faite
                let hasSignature = false;
                let isDrawing = false;
                
                // Initialiser le canvas de signature
                const canvas = document.getElementById('signaturePad');
                if (!canvas) return;
                
                const ctx = canvas.getContext('2d');
            
                // Configuration du canvas
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.strokeStyle = '#333';
            
                canvas.addEventListener('mousedown', startDrawing);
                canvas.addEventListener('mousemove', draw);
                canvas.addEventListener('mouseup', stopDrawing);
                canvas.addEventListener('mouseout', stopDrawing);
            
                function startDrawing(e) {{
                    isDrawing = true;
                    hasSignature = true; // Marquer qu'une signature a été commencée
                    draw(e);
                }}
                
                function draw(e) {{
                    if (!isDrawing) return;
                    
                    const rect = canvas.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    ctx.lineTo(x, y);
                    ctx.stroke();
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                }}
                
                function stopDrawing() {{
                    isDrawing = false;
                    ctx.beginPath();
                }}
                
                function clearSignature() {{
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    hasSignature = false; // Réinitialiser le flag de signature
                }}
            
                function approveRequest(id) {{
                    const comment = document.getElementById('comment').value;
                    
                    // Vérifier si une signature a été faite
                    if (!hasSignature) {{
                        showModal('Erreur', 'Veuillez apposer votre signature avant de continuer.', 'error');
                        return;
                    }}
                    
                    showModal('Confirmation', 'Êtes-vous sûr de vouloir approuver cette demande d\\'achat ?', 'confirm', function() {{
                showModal('Succès', 'Demande approuvée avec succès !<br><br><strong>Commentaire:</strong> ' + (comment || 'Aucun') + '<br><strong>Signature:</strong> Enregistrée', 'success');
                    // Mettre à jour le statut dans localStorage
                    updateRequestStatus(id, 'approved');
                    setTimeout(() => {{
                        window.location.href = '/purchase-requests';
                    }}, 2000);
                    }});
                }}
                
                function rejectRequest(id) {{
                    const comment = document.getElementById('comment').value;
                    
                    // Vérifier si une signature a été faite
                    if (!hasSignature) {{
                        showModal('Erreur', 'Veuillez apposer votre signature avant de continuer.', 'error');
                        return;
                    }}
                    
                    showModal('Confirmation', 'Êtes-vous sûr de vouloir rejeter cette demande d\\'achat ?', 'confirm', function() {{
                showModal('Information', 'Demande rejetée !<br><br><strong>Commentaire:</strong> ' + (comment || 'Aucun') + '<br><strong>Signature:</strong> Enregistrée', 'info');
                    // Mettre à jour le statut dans localStorage
                    updateRequestStatus(id, 'rejected');
                    setTimeout(() => {{
                        window.location.href = '/purchase-requests';
                    }}, 2000);
                    }});
                }}
                
                function goBack() {{
                    window.location.href = '/purchase-requests';
                }}
            
                // Fonction pour afficher les modales
                function showModal(title, message, type, callback = null) {{
                    const modal = document.createElement('div');
                    modal.className = 'modal';
                    modal.style.display = 'block';
                    
                    let icon = '';
                    let buttonClass = 'modal-btn-primary';
                    let buttonText = 'OK';
                    
                    switch(type) {{
                        case 'success':
                            icon = '✅';
                            buttonClass = 'modal-btn-success';
                            break;
                        case 'error':
                            icon = '❌';
                            buttonClass = 'modal-btn-danger';
                            break;
                        case 'info':
                            icon = 'ℹ️';
                            buttonClass = 'modal-btn-primary';
                            break;
                        case 'confirm':
                            icon = '❓';
                            buttonClass = 'modal-btn-primary';
                            buttonText = 'Confirmer';
                            break;
                    }}
                    
                    modal.innerHTML = `
                        <div class="modal-content">
                            <span class="close" onclick="closeModal(this)">&times;</span>
                            <div class="modal-header">
                                <div class="modal-icon">${{icon}}</div>
                                <div class="modal-title">${{title}}</div>
                            </div>
                            <div class="modal-message">${{message}}</div>
                            <div class="modal-buttons">
                                ${{type === 'confirm' ? `
                                    <button class="modal-btn modal-btn-secondary" onclick="closeModal(this)">Annuler</button>
                                    <button class="modal-btn ${{buttonClass}}" onclick="confirmAction(this)">${{buttonText}}</button>
                                ` : `
                                    <button class="modal-btn ${{buttonClass}}" onclick="closeModal(this)">${{buttonText}}</button>
                                `}}
                            </div>
                        </div>
                    `;
                    
                    document.body.appendChild(modal);
                    
                    // Stocker le callback pour la confirmation
                    if (callback && type === 'confirm') {{
                        modal._callback = callback;
                    }}
                    
                    // Fermer en cliquant à l'extérieur
                    modal.onclick = function(event) {{
                        if (event.target === modal) {{
                            closeModal(modal);
                        }}
                    }};
                }}
                
                function closeModal(element) {{
                    const modal = element.closest('.modal');
                    modal.style.display = 'none';
                    document.body.removeChild(modal);
                }}
                
                function confirmAction(element) {{
                    const modal = element.closest('.modal');
                    if (modal._callback) {{
                        modal._callback();
                    }}
                    closeModal(modal);
                }}
                
                // Fonction pour mettre à jour le statut des demandes
                function updateRequestStatus(id, status) {{
                    const requests = JSON.parse(localStorage.getItem('purchaseRequests') || '[]');
                    const requestIndex = requests.findIndex(req => req.id === id);
                    if (requestIndex !== -1) {{
                        requests[requestIndex].status = status;
                        requests[requestIndex].updatedAt = new Date().toISOString();
                        localStorage.setItem('purchaseRequests', JSON.stringify(requests));
                    }}
                }}
                
                // Exposer les fonctions globalement
                window.approveRequest = approveRequest;
                window.rejectRequest = rejectRequest;
                window.goBack = goBack;
                window.clearSignature = clearSignature;
                window.showModal = showModal;
                window.closeModal = closeModal;
                window.confirmAction = confirmAction;
                window.updateRequestStatus = updateRequestStatus;
            }});
        </script>
    </body>
    </html>
    """

# Route création de nouvelle demande d'achat
@app.get("/new-purchase-request", response_class=HTMLResponse)
async def new_purchase_request():
    """Formulaire de création de nouvelle demande d'achat"""
    return """
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nouvelle Demande d'Achat - Système de Gestion</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 2rem;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
            }
            .header {
                background: white;
                border-radius: 20px;
                padding: 2rem;
                text-align: center;
                margin-bottom: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .header-icon {
                font-size: 3rem;
                color: #667eea;
                margin-bottom: 1rem;
            }
            .header-title {
                color: #333;
                font-size: 2.5rem;
                font-weight: bold;
                margin-bottom: 0.5rem;
            }
            .header-subtitle {
                color: #666;
                font-size: 1.2rem;
            }
            .form-container {
                background: white;
                border-radius: 20px;
                padding: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .form-group {
                margin-bottom: 1.5rem;
            }
            .form-label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: bold;
                color: #333;
            }
            .form-input, .form-select, .form-textarea {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #e1e5e9;
                border-radius: 10px;
                font-size: 1rem;
            }
            .form-input:focus, .form-select:focus, .form-textarea:focus {
                outline: none;
                border-color: #667eea;
            }
            .form-textarea {
                min-height: 100px;
                resize: vertical;
            }
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
            }
            .btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 25px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-right: 1rem;
            }
            .btn-success {
                background: #28a745;
                color: white;
            }
            .btn-success:hover {
                background: #218838;
                transform: translateY(-2px);
            }
            .btn-secondary {
                background: #6c757d;
                color: white;
            }
            .btn-secondary:hover {
                background: #5a6268;
                transform: translateY(-2px);
            }
            .back-btn {
                position: fixed;
                top: 2rem;
                left: 2rem;
                background: rgba(255,255,255,0.9);
                border: 2px solid rgba(255,255,255,0.3);
                color: #333;
                padding: 1rem;
                text-decoration: none;
                border-radius: 50%;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            .back-btn:hover {
                background: white;
                transform: translateY(-2px);
            }
            .required {
                color: #dc3545;
            }
            
            /* Modal Styles */
            .modal {
                display: none;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.5);
                backdrop-filter: blur(5px);
            }
            
            .modal-content {
                background-color: white;
                margin: 15% auto;
                padding: 2rem;
                border-radius: 20px;
                width: 90%;
                max-width: 500px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                text-align: center;
                animation: modalSlideIn 0.3s ease-out;
            }
            
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-50px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .modal-header {
                margin-bottom: 1rem;
            }
            
            .modal-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }
            
            .modal-title {
                font-size: 1.5rem;
                font-weight: bold;
                margin-bottom: 1rem;
            }
            
            .modal-message {
                font-size: 1rem;
                line-height: 1.6;
                margin-bottom: 2rem;
                color: #666;
            }
            
            .modal-buttons {
                display: flex;
                gap: 1rem;
                justify-content: center;
            }
            
            .modal-btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 25px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 120px;
            }
            
            .modal-btn-primary {
                background: #667eea;
                color: white;
            }
            
            .modal-btn-primary:hover {
                background: #5a6fd8;
                transform: translateY(-2px);
            }
            
            .modal-btn-secondary {
                background: #6c757d;
                color: white;
            }
            
            .modal-btn-secondary:hover {
                background: #5a6268;
                transform: translateY(-2px);
            }
            
            .modal-btn-success {
                background: #28a745;
                color: white;
            }
            
            .modal-btn-success:hover {
                background: #218838;
                transform: translateY(-2px);
            }
            
            .modal-btn-danger {
                background: #dc3545;
                color: white;
            }
            
            .modal-btn-danger:hover {
                background: #c82333;
                transform: translateY(-2px);
            }
            
            .close {
                color: #aaa;
                float: right;
                font-size: 28px;
                font-weight: bold;
                cursor: pointer;
                position: absolute;
                right: 1rem;
                top: 1rem;
            }
            
            .close:hover {
                color: #000;
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                body {
                    padding: 0.5rem;
                }
                .container {
                    max-width: 100%;
                }
                .header {
                    padding: 1.5rem;
                    margin-bottom: 1rem;
                }
                .header-title {
                    font-size: 1.8rem;
                }
                .request-details, .approval-form {
                    padding: 1rem;
                }
                .form-group {
                    margin-bottom: 1rem;
                }
                .signature-pad {
                    width: 100%;
                    height: 150px;
                }
                .btn {
                    width: 100%;
                    margin: 0.5rem 0;
                }
                .back-btn, .home-btn {
                    position: relative;
                    top: auto;
                    left: auto;
                    right: auto;
                    margin: 0.5rem;
                    display: inline-block;
                }
            }
            
            @media (max-width: 480px) {
                .header-title {
                    font-size: 1.5rem;
                }
                .signature-pad {
                    height: 120px;
                }
                .detail-row {
                    flex-direction: column;
                    gap: 0.25rem;
                }
                .detail-label {
                    font-weight: bold;
                }
            }
        </style>
    </head>
    <body>
        <a href="/purchase-requests" class="back-btn">←</a>
        <a href="/dashboard" class="home-btn">🏠</a>
        
        <div class="container">
            <div class="header">
                <div class="header-icon">📝</div>
                <h1 class="header-title">Nouvelle Demande d'Achat</h1>
                <p class="header-subtitle">Créez une nouvelle demande d'achat pour votre service</p>
            </div>
            
            <div class="form-container">
                <form id="purchaseRequestForm">
                    <div class="form-group">
                        <label class="form-label" for="service">Service Demandeur <span class="required">*</span></label>
                        <select class="form-select" id="service" name="service" required>
                            <option value="">Sélectionnez votre service</option>
                            <option value="rh">Ressources Humaines</option>
                            <option value="it">Informatique</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="finance">Finance</option>
                            <option value="commercial">Commercial</option>
                            <option value="new">+ Créer un nouveau service</option>
                        </select>
                        <div id="newServiceForm" style="display: none; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 10px;">
                            <input type="text" class="form-input" id="newServiceName" placeholder="Nom du nouveau service" style="margin-bottom: 0.5rem;">
                            <input type="text" class="form-input" id="newServiceDescription" placeholder="Description du service" style="margin-bottom: 0.5rem;">
                            <input type="text" class="form-input" id="newServiceResponsible" placeholder="Responsable du service">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="article">Article Demandé <span class="required">*</span></label>
                        <input type="text" class="form-input" id="article" name="article" placeholder="Ex: Papier A4, Cartouches d'encre..." required>
                </div>
                
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="quantity">Quantité <span class="required">*</span></label>
                            <input type="number" class="form-input" id="quantity" name="quantity" min="1" required>
                    </div>
                        <div class="form-group">
                            <label class="form-label" for="unit">Unité</label>
                            <select class="form-select" id="unit" name="unit">
                                <option value="pieces">Pièces</option>
                                <option value="paquets">Paquets</option>
                                <option value="rouleaux">Rouleaux</option>
                                <option value="litres">Litres</option>
                                <option value="kg">Kilogrammes</option>
                                <option value="m">Mètres</option>
                            </select>
                        </div>
                </div>
                
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="estimatedPrice">Prix Estimé (GNF)</label>
                            <input type="number" class="form-input" id="estimatedPrice" name="estimatedPrice" min="0" step="0.01">
                    </div>
                        <div class="form-group">
                            <label class="form-label" for="urgency">Niveau d'Urgence <span class="required">*</span></label>
                            <select class="form-select" id="urgency" name="urgency" required>
                                <option value="">Sélectionnez l'urgence</option>
                                <option value="low">Faible</option>
                                <option value="normal">Normale</option>
                                <option value="high">Élevée</option>
                                <option value="urgent">Urgente</option>
                            </select>
                </div>
            </div>
            
                    <div class="form-group">
                        <label class="form-label" for="justification">Justification de la Demande <span class="required">*</span></label>
                        <textarea class="form-textarea" id="justification" name="justification" placeholder="Expliquez pourquoi cette demande est nécessaire..." required></textarea>
            </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="supplier">Fournisseur Préféré (optionnel)</label>
                        <select class="form-select" id="supplier" name="supplier">
                            <option value="">Aucun fournisseur spécifique</option>
                            <option value="fournisseur-general">Fournisseur Général</option>
                            <option value="equipements-bureau">Équipements Bureau</option>
                            <option value="station-total">Station Service Total</option>
                            <option value="new">+ Créer un nouveau fournisseur</option>
                        </select>
                        <div id="newSupplierForm" style="display: none; margin-top: 1rem; padding: 1rem; background: #f8f9fa; border-radius: 10px;">
                            <input type="text" class="form-input" id="newSupplierName" placeholder="Nom du fournisseur" style="margin-bottom: 0.5rem;">
                            <input type="text" class="form-input" id="newSupplierContact" placeholder="Personne de contact" style="margin-bottom: 0.5rem;">
                            <input type="email" class="form-input" id="newSupplierEmail" placeholder="Email du fournisseur" style="margin-bottom: 0.5rem;">
                            <input type="tel" class="form-input" id="newSupplierPhone" placeholder="Téléphone">
                        </div>
        </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="deliveryDate">Date de Livraison Souhaitée</label>
                        <input type="date" class="form-input" id="deliveryDate" name="deliveryDate">
                    </div>
                    
                    <div style="text-align: center; margin-top: 2rem;">
                        <button type="submit" class="btn btn-success">📝 Soumettre la Demande</button>
                        <button type="button" class="btn btn-secondary" onclick="goBack()">Annuler</button>
                    </div>
                </form>
            </div>
        </div>
        
        <script>
            document.getElementById('purchaseRequestForm').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                
                // Validation
                if (!data.service || !data.article || !data.quantity || !data.urgency || !data.justification) {
                    showModal('Erreur', 'Veuillez remplir tous les champs obligatoires marqués d\'un astérisque (*).', 'error');
                    return;
                }
                
                // Générer un numéro de demande
                const requestNumber = 'DEM-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
                
                // Afficher un résumé
                const summary = `
                    <strong>Demande créée avec succès !</strong><br><br>
                    <strong>N° Demande:</strong> ${requestNumber}<br>
                    <strong>Service:</strong> ${data.service}<br>
                    <strong>Article:</strong> ${data.article}<br>
                    <strong>Quantité:</strong> ${data.quantity} ${data.unit}<br>
                    <strong>Urgence:</strong> ${data.urgency}<br>
                    <strong>Prix estimé:</strong> ${data.estimatedPrice ? data.estimatedPrice + ' GNF' : 'Non spécifié'}<br><br>
                    Votre demande a été soumise et sera traitée par le responsable des achats.
                `;
                
                showModal('Succès', summary, 'success');
                
                // Rediriger vers la liste des demandes après 3 secondes
                setTimeout(() => {
                    window.location.href = '/purchase-requests';
                }, 3000);
            });
            
            function goBack() {
                window.location.href = '/purchase-requests';
            }
            
            // Auto-remplir la date de livraison (7 jours par défaut)
            const deliveryDate = new Date();
            deliveryDate.setDate(deliveryDate.getDate() + 7);
            document.getElementById('deliveryDate').value = deliveryDate.toISOString().slice(0,10);
            
            // Gestion de la création de nouveau service
            document.getElementById('service').addEventListener('change', function() {
                const newServiceForm = document.getElementById('newServiceForm');
                if (this.value === 'new') {
                    newServiceForm.style.display = 'block';
                } else {
                    newServiceForm.style.display = 'none';
                }
            });
            
            // Gestion de la création de nouveau fournisseur
            document.getElementById('supplier').addEventListener('change', function() {
                const newSupplierForm = document.getElementById('newSupplierForm');
                if (this.value === 'new') {
                    newSupplierForm.style.display = 'block';
                } else {
                    newSupplierForm.style.display = 'none';
                }
            });
            
            // Fonction pour afficher les modales
            function showModal(title, message, type, callback = null) {
                const modal = document.createElement('div');
                modal.className = 'modal';
                modal.style.display = 'block';
                
                let icon = '';
                let buttonClass = 'modal-btn-primary';
                let buttonText = 'OK';
                
                switch(type) {
                    case 'success':
                        icon = '✅';
                        buttonClass = 'modal-btn-success';
                        break;
                    case 'error':
                        icon = '❌';
                        buttonClass = 'modal-btn-danger';
                        break;
                    case 'info':
                        icon = 'ℹ️';
                        buttonClass = 'modal-btn-primary';
                        break;
                    case 'confirm':
                        icon = '❓';
                        buttonClass = 'modal-btn-primary';
                        buttonText = 'Confirmer';
                        break;
                }
                
                modal.innerHTML = `
                    <div class="modal-content">
                        <span class="close" onclick="closeModal(this)">&times;</span>
                        <div class="modal-header">
                            <div class="modal-icon">${icon}</div>
                            <div class="modal-title">${title}</div>
                        </div>
                        <div class="modal-message">${message}</div>
                        <div class="modal-buttons">
                            ${type === 'confirm' ? `
                                <button class="modal-btn modal-btn-secondary" onclick="closeModal(this)">Annuler</button>
                                <button class="modal-btn ${buttonClass}" onclick="confirmAction(this)">${buttonText}</button>
                            ` : `
                                <button class="modal-btn ${buttonClass}" onclick="closeModal(this)">${buttonText}</button>
                            `}
                        </div>
                    </div>
                `;
                
                document.body.appendChild(modal);
                
                // Stocker le callback pour la confirmation
                if (callback && type === 'confirm') {
                    modal._callback = callback;
                }
                
                // Fermer en cliquant à l'extérieur
                modal.onclick = function(event) {
                    if (event.target === modal) {
                        closeModal(modal);
                    }
                };
            }
            
            function closeModal(element) {
                const modal = element.closest('.modal');
                modal.style.display = 'none';
                document.body.removeChild(modal);
            }
            
            function confirmAction(element) {
                const modal = element.closest('.modal');
                if (modal._callback) {
                    modal._callback();
                }
                closeModal(modal);
            }
        </script>
    </body>
    </html>
    """

# Route création de nouveau véhicule
@app.get("/new-vehicle", response_class=HTMLResponse)
async def new_vehicle():
    """Formulaire de création de nouveau véhicule"""
    return """
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nouveau Véhicule - Système de Gestion</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 2rem;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
            }
            .header {
                background: white;
                border-radius: 20px;
                padding: 2rem;
                text-align: center;
                margin-bottom: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .header-icon {
                font-size: 3rem;
                color: #667eea;
                margin-bottom: 1rem;
            }
            .header-title {
                color: #333;
                font-size: 2.5rem;
                font-weight: bold;
                margin-bottom: 0.5rem;
            }
            .header-subtitle {
                color: #666;
                font-size: 1.2rem;
            }
            .form-container {
                background: white;
                border-radius: 20px;
                padding: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .form-group {
                margin-bottom: 1.5rem;
            }
            .form-label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: bold;
                color: #333;
            }
            .form-input, .form-select, .form-textarea {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #e1e5e9;
                border-radius: 10px;
                font-size: 1rem;
            }
            .form-input:focus, .form-select:focus, .form-textarea:focus {
                outline: none;
                border-color: #667eea;
            }
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
            }
            .btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 25px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-right: 1rem;
            }
            .btn-success {
                background: #28a745;
                color: white;
            }
            .btn-success:hover {
                background: #218838;
                transform: translateY(-2px);
            }
            .btn-secondary {
                background: #6c757d;
                color: white;
            }
            .btn-secondary:hover {
                background: #5a6268;
                transform: translateY(-2px);
            }
            .back-btn {
                position: fixed;
                top: 2rem;
                left: 2rem;
                background: rgba(255,255,255,0.9);
                border: 2px solid rgba(255,255,255,0.3);
                color: #333;
                padding: 1rem;
                text-decoration: none;
                border-radius: 50%;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            .back-btn:hover {
                background: white;
                transform: translateY(-2px);
            }
            .required {
                color: #dc3545;
            }
            
            /* Modal Styles */
            .modal {
                display: none;
                position: fixed;
                z-index: 1000;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.5);
                backdrop-filter: blur(5px);
            }
            
            .modal-content {
                background-color: white;
                margin: 15% auto;
                padding: 2rem;
                border-radius: 20px;
                width: 90%;
                max-width: 500px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                text-align: center;
                animation: modalSlideIn 0.3s ease-out;
            }
            
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-50px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .modal-header {
                margin-bottom: 1rem;
            }
            
            .modal-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }
            
            .modal-title {
                font-size: 1.5rem;
                font-weight: bold;
                margin-bottom: 1rem;
            }
            
            .modal-message {
                font-size: 1rem;
                line-height: 1.6;
                margin-bottom: 2rem;
                color: #666;
            }
            
            .modal-buttons {
                display: flex;
                gap: 1rem;
                justify-content: center;
            }
            
            .modal-btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 25px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                min-width: 120px;
            }
            
            .modal-btn-primary {
                background: #667eea;
                color: white;
            }
            
            .modal-btn-primary:hover {
                background: #5a6fd8;
                transform: translateY(-2px);
            }
            
            .modal-btn-secondary {
                background: #6c757d;
                color: white;
            }
            
            .modal-btn-secondary:hover {
                background: #5a6268;
                transform: translateY(-2px);
            }
            
            .modal-btn-success {
                background: #28a745;
                color: white;
            }
            
            .modal-btn-success:hover {
                background: #218838;
                transform: translateY(-2px);
            }
            
            .modal-btn-danger {
                background: #dc3545;
                color: white;
            }
            
            .modal-btn-danger:hover {
                background: #c82333;
                transform: translateY(-2px);
            }
            
            .close {
                color: #aaa;
                float: right;
                font-size: 28px;
                font-weight: bold;
                cursor: pointer;
                position: absolute;
                right: 1rem;
                top: 1rem;
            }
            
            .close:hover {
                color: #000;
            }
            
            /* Responsive Design */
            @media (max-width: 768px) {
                body {
                    padding: 0.5rem;
                }
                .container {
                    max-width: 100%;
                }
                .header {
                    padding: 1.5rem;
                    margin-bottom: 1rem;
                }
                .header-title {
                    font-size: 1.8rem;
                }
                .form-container {
                    padding: 1rem;
                }
                .form-row {
                    grid-template-columns: 1fr;
                }
                .form-group {
                    margin-bottom: 1rem;
                }
                .btn {
                    width: 100%;
                    margin: 0.5rem 0;
                }
                .back-btn, .home-btn {
                    position: relative;
                    top: auto;
                    left: auto;
                    right: auto;
                    margin: 0.5rem;
                    display: inline-block;
                }
            }
            
            @media (max-width: 480px) {
                .header-title {
                    font-size: 1.5rem;
                }
                .form-input, .form-select, .form-textarea {
                    font-size: 0.9rem;
                }
            }
        </style>
    </head>
    <body>
        <a href="/vehicles" class="back-btn">←</a>
        <a href="/dashboard" class="home-btn">🏠</a>
        
        <div class="container">
            <div class="header">
                <div class="header-icon">🚗</div>
                <h1 class="header-title">Nouveau Véhicule</h1>
                <p class="header-subtitle">Ajoutez un nouveau véhicule à votre flotte</p>
            </div>
            
            <div class="form-container">
                <form id="vehicleForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="plate">Plaque d'Immatriculation <span class="required">*</span></label>
                            <input type="text" class="form-input" id="plate" name="plate" placeholder="Ex: ABC-123" required>
                    </div>
                        <div class="form-group">
                            <label class="form-label" for="year">Année <span class="required">*</span></label>
                            <input type="number" class="form-input" id="year" name="year" min="1990" max="2025" required>
                        </div>
                </div>
                
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="brand">Marque <span class="required">*</span></label>
                            <input type="text" class="form-input" id="brand" name="brand" placeholder="Ex: Toyota, Ford..." required>
                    </div>
                        <div class="form-group">
                            <label class="form-label" for="model">Modèle <span class="required">*</span></label>
                            <input type="text" class="form-input" id="model" name="model" placeholder="Ex: Corolla, Transit..." required>
                        </div>
                </div>
                
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="color">Couleur</label>
                            <input type="text" class="form-input" id="color" name="color" placeholder="Ex: Blanc, Bleu...">
                    </div>
                        <div class="form-group">
                            <label class="form-label" for="fuelType">Type de Carburant <span class="required">*</span></label>
                            <select class="form-select" id="fuelType" name="fuelType" required>
                                <option value="">Sélectionnez le type</option>
                                <option value="essence">Essence</option>
                                <option value="diesel">Diesel</option>
                                <option value="hybride">Hybride</option>
                                <option value="electrique">Électrique</option>
                            </select>
                </div>
            </div>
            
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="mileage">Kilométrage Actuel</label>
                            <input type="number" class="form-input" id="mileage" name="mileage" min="0" placeholder="Ex: 45000">
            </div>
                        <div class="form-group">
                            <label class="form-label" for="status">Statut <span class="required">*</span></label>
                            <select class="form-select" id="status" name="status" required>
                                <option value="">Sélectionnez le statut</option>
                                <option value="active">Actif</option>
                                <option value="maintenance">En maintenance</option>
                                <option value="inactive">Inactif</option>
                            </select>
        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="notes">Notes (optionnel)</label>
                        <textarea class="form-textarea" id="notes" name="notes" placeholder="Informations supplémentaires sur le véhicule..."></textarea>
                    </div>
                    
                    <div style="text-align: center; margin-top: 2rem;">
                        <button type="submit" class="btn btn-success">🚗 Ajouter le Véhicule</button>
                        <button type="button" class="btn btn-secondary" onclick="goBack()">Annuler</button>
                    </div>
                </form>
            </div>
        </div>
        
        <script>
            // Attendre que le DOM soit chargé
            document.addEventListener('DOMContentLoaded', function() {
                const form = document.getElementById('vehicleForm');
                if (form) {
                    form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                
                // Validation
                if (!data.plate || !data.year || !data.brand || !data.model || !data.fuelType || !data.status) {
                    showModal('Erreur', 'Veuillez remplir tous les champs obligatoires marqués d\'un astérisque (*).', 'error');
                    return;
                }
                
                // Afficher un résumé
                const summary = `
                    <strong>Véhicule ajouté avec succès !</strong><br><br>
                    <strong>Plaque:</strong> ${data.plate}<br>
                    <strong>Marque/Modèle:</strong> ${data.brand} ${data.model}<br>
                    <strong>Année:</strong> ${data.year}<br>
                    <strong>Couleur:</strong> ${data.color || 'Non spécifiée'}<br>
                    <strong>Carburant:</strong> ${data.fuelType}<br>
                    <strong>Kilométrage:</strong> ${data.mileage || 'Non spécifié'} km<br>
                    <strong>Statut:</strong> ${data.status}<br><br>
                    Le véhicule a été ajouté à votre flotte.
                `;
                
                showModal('Succès', summary, 'success');
                
                // Ajouter le véhicule à la table
                addVehicleToTable(data);
                
                // Rediriger vers la liste des véhicules après 2 secondes
                setTimeout(() => {
                    window.location.href = '/vehicles';
                }, 2000);
                    });
                }
            });
            
                function goBack() {
                    window.location.href = '/vehicles';
                }
                
                // Fonction pour ajouter un véhicule à la table
                function addVehicleToTable(data) {
                    // Stocker le véhicule dans localStorage pour qu'il apparaisse dans la liste
                    const vehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
                    const newVehicle = {
                        id: Date.now(), // ID unique basé sur le timestamp
                        plate: data.plate,
                        brand: data.brand,
                        model: data.model,
                        year: data.year,
                        color: data.color || 'Non spécifiée',
                        mileage: data.mileage || 'Non spécifié',
                        fuelType: data.fuelType,
                        status: data.status
                    };
                    vehicles.push(newVehicle);
                    localStorage.setItem('vehicles', JSON.stringify(vehicles));
                }
                
                // Fonction pour afficher les modales
                function showModal(title, message, type, callback = null) {
                    const modal = document.createElement('div');
                    modal.className = 'modal';
                    modal.style.display = 'block';
                    
                    let icon = '';
                    let buttonClass = 'modal-btn-primary';
                    let buttonText = 'OK';
                    
                    switch(type) {
                        case 'success':
                            icon = '✅';
                            buttonClass = 'modal-btn-success';
                            break;
                        case 'error':
                            icon = '❌';
                            buttonClass = 'modal-btn-danger';
                            break;
                        case 'info':
                            icon = 'ℹ️';
                            buttonClass = 'modal-btn-primary';
                            break;
                        case 'confirm':
                            icon = '❓';
                            buttonClass = 'modal-btn-primary';
                            buttonText = 'Confirmer';
                            break;
                    }
                    
                    modal.innerHTML = `
                        <div class="modal-content">
                            <span class="close" onclick="closeModal(this)">&times;</span>
                            <div class="modal-header">
                                <div class="modal-icon">${icon}</div>
                                <div class="modal-title">${title}</div>
                            </div>
                            <div class="modal-message">${message}</div>
                            <div class="modal-buttons">
                                ${type === 'confirm' ? `
                                    <button class="modal-btn modal-btn-secondary" onclick="closeModal(this)">Annuler</button>
                                    <button class="modal-btn ${buttonClass}" onclick="confirmAction(this)">${buttonText}</button>
                                ` : `
                                    <button class="modal-btn ${buttonClass}" onclick="closeModal(this)">${buttonText}</button>
                                `}
                            </div>
                        </div>
                    `;
                    
                    document.body.appendChild(modal);
                    
                    // Stocker le callback pour la confirmation
                    if (callback && type === 'confirm') {
                        modal._callback = callback;
                    }
                    
                    // Fermer en cliquant à l'extérieur
                    modal.onclick = function(event) {
                        if (event.target === modal) {
                            closeModal(modal);
                        }
                    };
                }
                
                function closeModal(element) {
                    const modal = element.closest('.modal');
                    modal.style.display = 'none';
                    document.body.removeChild(modal);
                }
                
                function confirmAction(element) {
                    const modal = element.closest('.modal');
                    if (modal._callback) {
                        modal._callback();
                    }
                    closeModal(modal);
                }
                
                // Exposer les fonctions globalement
                window.goBack = goBack;
                window.addVehicleToTable = addVehicleToTable;
                window.showModal = showModal;
                window.closeModal = closeModal;
                window.confirmAction = confirmAction;
            });
        </script>
    </body>
    </html>
    """

# Route création de nouveau service
@app.get("/new-service", response_class=HTMLResponse)
async def new_service():
    """Formulaire de création de nouveau service"""
    return """
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nouveau Service - Système de Gestion</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 2rem;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
            }
            .header {
                background: white;
                border-radius: 20px;
                padding: 2rem;
                text-align: center;
                margin-bottom: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .header-icon {
                font-size: 3rem;
                color: #667eea;
                margin-bottom: 1rem;
            }
            .header-title {
                color: #333;
                font-size: 2.5rem;
                font-weight: bold;
                margin-bottom: 0.5rem;
            }
            .header-subtitle {
                color: #666;
                font-size: 1.2rem;
            }
            .form-container {
                background: white;
                border-radius: 20px;
                padding: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .form-group {
                margin-bottom: 1.5rem;
            }
            .form-label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: bold;
                color: #333;
            }
            .form-input, .form-select, .form-textarea {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #e1e5e9;
                border-radius: 10px;
                font-size: 1rem;
            }
            .form-input:focus, .form-select:focus, .form-textarea:focus {
                outline: none;
                border-color: #667eea;
            }
            .form-textarea {
                min-height: 100px;
                resize: vertical;
            }
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
            }
            .btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 25px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-right: 1rem;
            }
            .btn-success {
                background: #28a745;
                color: white;
            }
            .btn-success:hover {
                background: #218838;
                transform: translateY(-2px);
            }
            .btn-secondary {
                background: #6c757d;
                color: white;
            }
            .btn-secondary:hover {
                background: #5a6268;
                transform: translateY(-2px);
            }
            .back-btn {
                position: fixed;
                top: 2rem;
                left: 2rem;
                background: rgba(255,255,255,0.9);
                border: 2px solid rgba(255,255,255,0.3);
                color: #333;
                padding: 1rem;
                text-decoration: none;
                border-radius: 50%;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            .back-btn:hover {
                background: white;
                transform: translateY(-2px);
            }
            .required {
                color: #dc3545;
            }
        </style>
    </head>
    <body>
        <a href="/services" class="back-btn">←</a>
        <a href="/dashboard" class="home-btn">🏠</a>
        
        <div class="container">
            <div class="header">
                <div class="header-icon">🏢</div>
                <h1 class="header-title">Nouveau Service</h1>
                <p class="header-subtitle">Créez un nouveau service dans votre organisation</p>
            </div>
            
            <div class="form-container">
                <form id="serviceForm">
                    <div class="form-group">
                        <label class="form-label" for="name">Nom du Service <span class="required">*</span></label>
                        <input type="text" class="form-input" id="name" name="name" placeholder="Ex: Ressources Humaines" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="description">Description <span class="required">*</span></label>
                        <textarea class="form-textarea" id="description" name="description" placeholder="Décrivez les responsabilités et activités du service..." required></textarea>
                </div>
                
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="responsible">Responsable <span class="required">*</span></label>
                            <input type="text" class="form-input" id="responsible" name="responsible" placeholder="Ex: Mme Diallo" required>
                    </div>
                        <div class="form-group">
                            <label class="form-label" for="email">Email <span class="required">*</span></label>
                            <input type="email" class="form-input" id="email" name="email" placeholder="Ex: rh@entreprise.com" required>
                        </div>
                </div>
                
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="phone">Téléphone</label>
                            <input type="tel" class="form-input" id="phone" name="phone" placeholder="Ex: +224 123 456 789">
                    </div>
                        <div class="form-group">
                            <label class="form-label" for="status">Statut <span class="required">*</span></label>
                            <select class="form-select" id="status" name="status" required>
                                <option value="">Sélectionnez le statut</option>
                                <option value="active">Actif</option>
                                <option value="inactive">Inactif</option>
                            </select>
                </div>
            </div>
            
                    <div style="text-align: center; margin-top: 2rem;">
                        <button type="submit" class="btn btn-success">🏢 Créer le Service</button>
                        <button type="button" class="btn btn-secondary" onclick="goBack()">Annuler</button>
            </div>
                </form>
        </div>
        </div>
        
        <script>
            document.getElementById('serviceForm').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                
                // Validation
                if (!data.name || !data.description || !data.responsible || !data.email || !data.status) {
                    alert('Veuillez remplir tous les champs obligatoires');
                    return;
                }
                
                // Afficher un résumé
                const summary = `
Service créé avec succès !

Nom: ${data.name}
Responsable: ${data.responsible}
Email: ${data.email}
Téléphone: ${data.phone || 'Non spécifié'}
Statut: ${data.status}

Le service a été ajouté à votre organisation.
                `;
                
                alert(summary);
                
                // Rediriger vers la liste des services
                window.location.href = '/services';
            });
            
            function goBack() {
                window.location.href = '/services';
            }
        </script>
    </body>
    </html>
    """

# Route création de nouveau fournisseur
@app.get("/new-supplier", response_class=HTMLResponse)
async def new_supplier():
    """Formulaire de création de nouveau fournisseur"""
    return """
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nouveau Fournisseur - Système de Gestion</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 2rem;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
            }
            .header {
                background: white;
                border-radius: 20px;
                padding: 2rem;
                text-align: center;
                margin-bottom: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .header-icon {
                font-size: 3rem;
                color: #667eea;
                margin-bottom: 1rem;
            }
            .header-title {
                color: #333;
                font-size: 2.5rem;
                font-weight: bold;
                margin-bottom: 0.5rem;
            }
            .header-subtitle {
                color: #666;
                font-size: 1.2rem;
            }
            .form-container {
                background: white;
                border-radius: 20px;
                padding: 2rem;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }
            .form-group {
                margin-bottom: 1.5rem;
            }
            .form-label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: bold;
                color: #333;
            }
            .form-input, .form-select, .form-textarea {
                width: 100%;
                padding: 0.75rem;
                border: 2px solid #e1e5e9;
                border-radius: 10px;
                font-size: 1rem;
            }
            .form-input:focus, .form-select:focus, .form-textarea:focus {
                outline: none;
                border-color: #667eea;
            }
            .form-textarea {
                min-height: 100px;
                resize: vertical;
            }
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
            }
            .btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 25px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-right: 1rem;
            }
            .btn-success {
                background: #28a745;
                color: white;
            }
            .btn-success:hover {
                background: #218838;
                transform: translateY(-2px);
            }
            .btn-secondary {
                background: #6c757d;
                color: white;
            }
            .btn-secondary:hover {
                background: #5a6268;
                transform: translateY(-2px);
            }
            .back-btn {
                position: fixed;
                top: 2rem;
                left: 2rem;
                background: rgba(255,255,255,0.9);
                border: 2px solid rgba(255,255,255,0.3);
                color: #333;
                padding: 1rem;
                text-decoration: none;
                border-radius: 50%;
                transition: all 0.3s ease;
                box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            }
            .back-btn:hover {
                background: white;
                transform: translateY(-2px);
            }
            .required {
                color: #dc3545;
            }
        </style>
    </head>
    <body>
        <a href="/suppliers" class="back-btn">←</a>
        <a href="/dashboard" class="home-btn">🏠</a>
        
        <div class="container">
            <div class="header">
                <div class="header-icon">🏪</div>
                <h1 class="header-title">Nouveau Fournisseur</h1>
                <p class="header-subtitle">Ajoutez un nouveau fournisseur à votre base de données</p>
            </div>
            
            <div class="form-container">
                <form id="supplierForm">
                    <div class="form-group">
                        <label class="form-label" for="name">Nom du Fournisseur <span class="required">*</span></label>
                        <input type="text" class="form-input" id="name" name="name" placeholder="Ex: Fournisseur Général" required>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="contact">Personne de Contact <span class="required">*</span></label>
                            <input type="text" class="form-input" id="contact" name="contact" placeholder="Ex: M. Diallo" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="email">Email <span class="required">*</span></label>
                            <input type="email" class="form-input" id="email" name="email" placeholder="Ex: contact@fournisseur.com" required>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label" for="phone">Téléphone <span class="required">*</span></label>
                            <input type="tel" class="form-input" id="phone" name="phone" placeholder="Ex: +224 123 456 789" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label" for="paymentTerms">Conditions de Paiement</label>
                            <select class="form-select" id="paymentTerms" name="paymentTerms">
                                <option value="">Sélectionnez</option>
                                <option value="comptant">Paiement comptant</option>
                                <option value="15-jours">15 jours</option>
                                <option value="30-jours">30 jours</option>
                                <option value="60-jours">60 jours</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="address">Adresse</label>
                        <textarea class="form-textarea" id="address" name="address" placeholder="Adresse complète du fournisseur..."></textarea>
                    </div>
                    
                    <div style="text-align: center; margin-top: 2rem;">
                        <button type="submit" class="btn btn-success">🏪 Créer le Fournisseur</button>
                        <button type="button" class="btn btn-secondary" onclick="goBack()">Annuler</button>
                    </div>
                </form>
            </div>
        </div>
        
        <script>
            document.getElementById('supplierForm').addEventListener('submit', function(e) {
                e.preventDefault();
                
                const formData = new FormData(e.target);
                const data = Object.fromEntries(formData.entries());
                
                // Validation
                if (!data.name || !data.contact || !data.email || !data.phone) {
                    alert('Veuillez remplir tous les champs obligatoires');
                    return;
                }
                
                // Afficher un résumé
                const summary = `
Fournisseur créé avec succès !

Nom: ${data.name}
Contact: ${data.contact}
Email: ${data.email}
Téléphone: ${data.phone}
Conditions: ${data.paymentTerms || 'Non spécifiées'}
Adresse: ${data.address || 'Non spécifiée'}

Le fournisseur a été ajouté à votre base de données.
                `;
                
                alert(summary);
                
                // Rediriger vers la liste des fournisseurs
                window.location.href = '/suppliers';
            });
            
            function goBack() {
                window.location.href = '/suppliers';
            }
        </script>
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
