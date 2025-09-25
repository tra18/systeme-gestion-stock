from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
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

# Servir les fichiers statiques (pour le frontend)
if os.path.exists("static"):
    app.mount("/static", StaticFiles(directory="static"), name="static")

# Routes principales
@app.get("/", response_class=HTMLResponse)
async def root():
    """Page d'accueil avec interface utilisateur conviviale"""
    return """
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Système de Gestion Intégré</title>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, rgba(102, 126, 234, 0.9) 0%, rgba(118, 75, 162, 0.9) 100%), 
                            url('/static/vitach-logo.svg') center/cover no-repeat fixed;
                min-height: 100vh;
                color: #333;
                position: relative;
            }
            
            body::before {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: url('/static/vitach-logo.svg') center/cover no-repeat;
                opacity: 0.1;
                z-index: -1;
            }
            
            .container {
                max-width: 1400px;
                margin: 0 auto;
                padding: 20px;
            }
            
            .header {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 15px;
                padding: 30px;
                margin-bottom: 30px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                text-align: center;
            }
            
            .header h1 {
                color: #2c3e50;
                font-size: 2.5em;
                margin-bottom: 10px;
            }
            
            .header p {
                color: #7f8c8d;
                font-size: 1.2em;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .stat-card {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 15px;
                padding: 25px;
                text-align: center;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                transition: transform 0.3s ease;
            }
            
            .stat-card:hover {
                transform: translateY(-5px);
            }
            
            @keyframes blink {
                0%, 50% { color: #e74c3c; }
                51%, 100% { color: #c0392b; }
            }
            
            .stat-icon {
                font-size: 3em;
                margin-bottom: 15px;
            }
            
            .stat-number {
                font-size: 2.5em;
                font-weight: bold;
                color: #3498db;
                margin-bottom: 5px;
            }
            
            .stat-label {
                color: #7f8c8d;
                font-size: 1.1em;
            }
            
            .modules-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
                gap: 25px;
                margin-bottom: 30px;
            }
            
            .module-card {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 15px;
                padding: 30px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
            }
            
            .module-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
            }
            
            .module-icon {
                font-size: 3em;
                margin-bottom: 20px;
                color: #3498db;
            }
            
            .module-title {
                font-size: 1.5em;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 15px;
            }
            
            .module-description {
                color: #7f8c8d;
                margin-bottom: 20px;
                line-height: 1.6;
            }
            
            .btn {
                display: inline-block;
                padding: 12px 25px;
                background: linear-gradient(45deg, #3498db, #2980b9);
                color: white;
                text-decoration: none;
                border-radius: 25px;
                font-weight: bold;
                transition: all 0.3s ease;
                margin: 5px;
                border: none;
                cursor: pointer;
            }
            
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(52, 152, 219, 0.4);
            }
            
            .btn-success {
                background: linear-gradient(45deg, #27ae60, #229954);
            }
            
            .btn-warning {
                background: linear-gradient(45deg, #f39c12, #e67e22);
            }
            
            .btn-danger {
                background: linear-gradient(45deg, #e74c3c, #c0392b);
            }
            
            .module-family {
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                border-radius: 15px;
                padding: 25px;
                margin-bottom: 20px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            }
            
            .module-family h3 {
                color: #2c3e50;
                margin-bottom: 20px;
                font-size: 1.4em;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .family-buttons {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
            }
            
            .loading {
                display: none;
                text-align: center;
                padding: 20px;
            }
            
            .spinner {
                border: 4px solid #f3f3f3;
                border-top: 4px solid #3498db;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                animation: spin 1s linear infinite;
                margin: 0 auto;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .alert {
                background: #e74c3c;
                color: white;
                padding: 15px;
                border-radius: 8px;
                margin: 10px 0;
                display: none;
            }
            
            @media (max-width: 768px) {
                .header h1 { font-size: 2em; }
                .stats-grid { grid-template-columns: 1fr; }
                .modules-grid { grid-template-columns: 1fr; }
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="/static/vitach-logo.svg" alt="VITACH GUINÉE" style="height: 80px; margin-bottom: 15px;">
                </div>
                <h1><i class="fas fa-rocket"></i> Système de Gestion Intégré</h1>
                <p>Gestion complète des achats, stock et logistique avec suivi des véhicules</p>
            </div>
            
            <div class="loading" id="loading">
                <div class="spinner"></div>
                <p>Chargement des données...</p>
            </div>
            
            <div class="alert" id="error-alert">
                <i class="fas fa-exclamation-triangle"></i>
                <span id="error-message"></span>
            </div>
            
            <div class="stats-grid" id="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-shopping-cart"></i></div>
                    <div class="stat-number" id="total-purchases">-</div>
                    <div class="stat-label">Total Achats</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-car"></i></div>
                    <div class="stat-number" id="total-vehicles">-</div>
                    <div class="stat-label">Véhicules</div>
                </div>
                <div class="stat-card" onclick="goToCriticalStock()" style="cursor: pointer; transition: all 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    <div class="stat-icon" id="stock-low-icon" style="animation: blink 1.5s infinite;"><i class="fas fa-exclamation-triangle"></i></div>
                    <div class="stat-number" id="low-stock">-</div>
                    <div class="stat-label">Stock Bas <small style="color: #e74c3c; font-size: 0.8em;">(Cliquez pour voir)</small></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-wrench"></i></div>
                    <div class="stat-number" id="maintenance">-</div>
                    <div class="stat-label">Maintenances</div>
                </div>
            </div>
            
            <div class="modules-grid">
                <div class="module-card">
                    <div class="module-icon"><i class="fas fa-shopping-bag"></i></div>
                    <div class="module-title">Gestion des Achats</div>
                    <div class="module-description">
                        Enregistrez et suivez vos achats par période (journalier, hebdomadaire, mensuel, semestriel, annuel). 
                        Analysez les dépenses par catégorie et générez des rapports détaillés.
                    </div>
                    <button onclick="showPurchaseForm()" class="btn btn-success">
                        <i class="fas fa-plus"></i> Nouvel Achat
                    </button>
                    <button onclick="showPurchaseList()" class="btn">
                        <i class="fas fa-list"></i> Voir Achats
                    </button>
                </div>
                
                <div class="module-card">
                    <div class="module-icon"><i class="fas fa-boxes"></i></div>
                    <div class="module-title">Gestion du Stock</div>
                    <div class="module-description">
                        Contrôlez votre inventaire avec alertes de seuil automatiques. 
                        Gérez les mouvements de stock et recevez des notifications de réapprovisionnement.
                    </div>
                    <button onclick="showStockForm()" class="btn btn-warning">
                        <i class="fas fa-plus"></i> Ajouter Article
                    </button>
                    <button onclick="showStockList()" class="btn">
                        <i class="fas fa-list"></i> Voir Stock
                    </button>
                    <button onclick="showStockMovements()" class="btn btn-success">
                        <i class="fas fa-exchange-alt"></i> Mouvements
                    </button>
                </div>
                
                <div class="module-card">
                    <div class="module-icon"><i class="fas fa-truck"></i></div>
                    <div class="module-title">Suivi des Véhicules</div>
                    <div class="module-description">
                        Gérez l'entretien, le carburant et l'historique complet de vos véhicules. 
                        Planifiez les maintenances et suivez les coûts d'exploitation.
                    </div>
                    <button onclick="showVehicleForm()" class="btn btn-danger">
                        <i class="fas fa-plus"></i> Nouveau Véhicule
                    </button>
                    <button onclick="showVehicleList()" class="btn">
                        <i class="fas fa-list"></i> Voir Véhicules
                    </button>
                </div>
                
                <div class="module-card">
                    <div class="module-icon"><i class="fas fa-chart-line"></i></div>
                    <div class="module-title">Rapports & Analytics</div>
                    <div class="module-description">
                        Tableaux de bord interactifs, rapports financiers détaillés et analyses prédictives. 
                        Visualisez les tendances et optimisez vos processus.
                    </div>
                    <button onclick="showReports()" class="btn">
                        <i class="fas fa-chart-bar"></i> Voir Rapports
                    </button>
                    <button onclick="showDashboard()" class="btn btn-success">
                        <i class="fas fa-tachometer-alt"></i> Tableau de Bord
                    </button>
                </div>
            </div>
            
            <!-- Gestion des Achats et Stock -->
            <div class="module-family">
                <h3><i class="fas fa-shopping-cart"></i> Gestion des Achats & Stock</h3>
                <div class="family-buttons">
                    <button onclick="showPurchaseRequests()" class="btn btn-primary">
                        <i class="fas fa-file-invoice"></i> Demandes d'Achat
                    </button>
                    <button onclick="showPurchases()" class="btn btn-success">
                        <i class="fas fa-shopping-cart"></i> Gestion Achats
                    </button>
                    <button onclick="showStock()" class="btn btn-success">
                        <i class="fas fa-boxes"></i> Gestion Stock
                    </button>
                    <button onclick="showSuppliers()" class="btn btn-warning">
                        <i class="fas fa-truck-loading"></i> Fournisseurs
                    </button>
                </div>
            </div>
            
            <!-- Gestion des Véhicules -->
            <div class="module-family">
                <h3><i class="fas fa-car"></i> Gestion des Véhicules</h3>
                <div class="family-buttons">
                    <button onclick="showVehicles()" class="btn btn-success">
                        <i class="fas fa-car"></i> Véhicules
                    </button>
                    <button onclick="showMaintenance()" class="btn btn-info">
                        <i class="fas fa-wrench"></i> Entretiens & Pannes
                    </button>
                </div>
            </div>
            
            <!-- Gestion Administrative -->
            <div class="module-family">
                <h3><i class="fas fa-cogs"></i> Administration</h3>
                <div class="family-buttons">
                    <button onclick="showServices()" class="btn btn-primary">
                        <i class="fas fa-building"></i> Services
                    </button>
                    <button onclick="showServiceProviders()" class="btn btn-success">
                        <i class="fas fa-tools"></i> Prestataires
                    </button>
                    <button onclick="showUserManagement()" class="btn btn-info" id="user-management-btn" style="display: none;">
                        <i class="fas fa-users-cog"></i> Utilisateurs
                    </button>
                </div>
            </div>
            
            <!-- Rapports et Export -->
            <div class="module-family">
                <h3><i class="fas fa-chart-line"></i> Rapports & Export</h3>
                <div class="family-buttons">
                    <button onclick="showReports()" class="btn btn-success">
                        <i class="fas fa-chart-bar"></i> Rapports
                    </button>
                    <button onclick="exportData()" class="btn btn-warning">
                        <i class="fas fa-download"></i> Exporter Données
                    </button>
                </div>
            </div>
            
            <!-- Actions Système -->
            <div class="module-family">
                <h3><i class="fas fa-tools"></i> Actions Système</h3>
                <div class="family-buttons">
                    <button onclick="refreshDashboard()" class="btn">
                        <i class="fas fa-sync-alt"></i> Actualiser
                    </button>
                    <button onclick="logout()" class="btn btn-danger">
                        <i class="fas fa-sign-out-alt"></i> Déconnexion
                    </button>
                </div>
            </div>
        </div>
        
        <script>
            // Charger les données du tableau de bord
            async function loadDashboard() {
                try {
                    document.getElementById('loading').style.display = 'block';
                    document.getElementById('error-alert').style.display = 'none';
                    
                    const response = await fetch('/api/reports/dashboard');
                    if (!response.ok) {
                        throw new Error('Erreur lors du chargement des données');
                    }
                    
                    const data = await response.json();
                    
                    // Mettre à jour les statistiques
                    document.getElementById('total-purchases').textContent = data.total_purchases.toLocaleString() + ' GNF';
                    document.getElementById('total-vehicles').textContent = data.total_vehicles;
                    document.getElementById('low-stock').textContent = data.low_stock_items;
                    document.getElementById('maintenance').textContent = data.upcoming_maintenance;
                    
                    document.getElementById('loading').style.display = 'none';
                } catch (error) {
                    console.error('Erreur:', error);
                    document.getElementById('loading').style.display = 'none';
                    document.getElementById('error-message').textContent = error.message;
                    document.getElementById('error-alert').style.display = 'block';
                }
            }
            
            // Actualiser le tableau de bord
            function refreshDashboard() {
                loadDashboard();
            }
            
            // Fonctions pour les formulaires et listes
            function showPurchaseForm() {
                window.open('/purchases', '_blank');
            }
            
            function showPurchaseList() {
                window.open('/purchases/list', '_blank');
            }
            
            function showStockForm() {
                window.open('/stock', '_blank');
            }
            
            function showStockList() {
                window.open('/stock/list', '_blank');
            }
            
            function showVehicleForm() {
                window.open('/vehicles', '_blank');
            }
            
            function showVehicleList() {
                window.open('/vehicles/list', '_blank');
            }
            
            function showReports() {
                window.open('/reports', '_blank');
            }
            
            function showDashboard() {
                window.open('/api/reports/dashboard', '_blank');
            }
            
            function exportData() {
                try {
                    // Créer un rapport global
                    const today = new Date().toISOString().split('T')[0];
                    let csv = 'Rapport Global - ' + today + '\\n\\n';
                    
                    // Ajouter les statistiques du tableau de bord
                    csv += 'STATISTIQUES GÉNÉRALES\\n';
                    csv += 'Total Achats,' + (document.getElementById('total-purchases')?.textContent || '0') + '\\n';
                    csv += 'Total Véhicules,' + (document.getElementById('total-vehicles')?.textContent || '0') + '\\n';
                    csv += 'Stock Bas,' + (document.getElementById('low-stock')?.textContent || '0') + '\\n';
                    csv += 'Maintenances,' + (document.getElementById('maintenance')?.textContent || '0') + '\\n\\n';
                    
                    csv += 'Ce rapport a été généré le ' + new Date().toLocaleDateString('fr-FR') + '\\n';
                    csv += 'Pour des données détaillées, utilisez les fonctions d\\'export spécifiques de chaque module.\\n';
                    
                    // Télécharger le fichier
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const link = document.createElement('a');
                    const url = URL.createObjectURL(blob);
                    link.setAttribute('href', url);
                    link.setAttribute('download', `rapport_global_${today}.csv`);
                    link.style.visibility = 'hidden';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    
                    alert('Rapport global exporté avec succès !');
                } catch (error) {
                    alert('Erreur lors de l\\'export: ' + error.message);
                }
            }
            
        function showPurchases() {
            window.open('/purchases', '_blank');
        }
        
        function showStock() {
            window.open('/stock', '_blank');
        }
        
        function showVehicles() {
            window.open('/vehicles', '_blank');
        }
        
        function showMaintenance() {
            window.open('/maintenance', '_blank');
        }
        
        function showPurchaseRequests() {
            window.open('/purchase-requests', '_blank');
        }
        
        function showServices() {
            window.open('/services', '_blank');
        }
        
        function showSuppliers() {
            window.open('/suppliers', '_blank');
        }
        
        function showServiceProviders() {
            window.open('/service-providers', '_blank');
        }
        
        function showUserManagement() {
            window.open('/user-management', '_blank');
        }
        
        // Fonctions pour les modules
        function showPurchaseForm() {
            window.open('/purchases', '_blank');
        }
        
        function showPurchaseList() {
            window.open('/purchases', '_blank');
        }
        
        function showStockForm() {
            window.open('/stock', '_blank');
        }
        
        function showStockList() {
            window.open('/stock', '_blank');
        }
        
        function showStockMovements() {
            window.open('/stock-movements', '_blank');
        }
        
        function showVehicleForm() {
            window.open('/vehicles', '_blank');
        }
        
        function showVehicleList() {
            window.open('/vehicles', '_blank');
        }
        
        function showReports() {
            window.open('/maintenance', '_blank');
        }
        
        function showDashboard() {
            window.location.reload();
        }
        
        function goToCriticalStock() {
            // Ouvrir la page stock avec un paramètre pour mettre en évidence le stock critique
            window.open('/stock?highlight=critical', '_blank');
        }
        
        function logout() {
            localStorage.removeItem('access_token');
            localStorage.removeItem('token_type');
            window.location.href = '/login';
        }
            
            // Charger les données au démarrage
            document.addEventListener('DOMContentLoaded', function() {
                loadDashboard();
                checkUserPermissions();
            });
            
            function checkUserPermissions() {
                // Vérifier si l'utilisateur peut gérer les utilisateurs
                const token = localStorage.getItem('access_token');
                if (token) {
                    fetch('/api/auth/me', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                    .then(response => response.json())
                    .then(user => {
                        if (user.can_manage_users || user.role === 'admin') {
                            document.getElementById('user-management-btn').style.display = 'inline-block';
                        }
                    })
                    .catch(error => console.log('Erreur lors de la vérification des permissions:', error));
                }
            }
            
            // Actualiser automatiquement toutes les 5 minutes
            setInterval(loadDashboard, 300000);
        </script>
    </body>
    </html>
    """

@app.get("/health")
async def health_check():
    """Vérification de l'état de l'application"""
    return {"status": "healthy", "message": "Système de gestion intégré opérationnel"}

# Routes pour les pages d'interface utilisateur
@app.get("/login", response_class=HTMLResponse)
async def login_page():
    """Page de connexion"""
    with open("templates/login.html", "r", encoding="utf-8") as f:
        return f.read()

@app.get("/suppliers", response_class=HTMLResponse)
async def suppliers_page():
    """Page de gestion des fournisseurs"""
    with open("templates/suppliers.html", "r", encoding="utf-8") as f:
        return f.read()

@app.get("/vehicles", response_class=HTMLResponse)
async def vehicles_page():
    """Page de gestion des véhicules"""
    with open("templates/vehicles.html", "r", encoding="utf-8") as f:
        return f.read()

@app.get("/stock", response_class=HTMLResponse)
async def stock_page():
    """Page de gestion du stock"""
    with open("templates/stock.html", "r", encoding="utf-8") as f:
        return f.read()

@app.get("/maintenance", response_class=HTMLResponse)
async def maintenance_page():
    """Page de gestion des entretiens et pannes"""
    with open("templates/maintenance.html", "r", encoding="utf-8") as f:
        return f.read()

@app.get("/service-providers", response_class=HTMLResponse)
async def service_providers_page():
    """Page de gestion des prestataires de service"""
    with open("templates/service_providers.html", "r", encoding="utf-8") as f:
        return f.read()

@app.get("/user-management", response_class=HTMLResponse)
async def user_management_page():
    """Page de gestion des utilisateurs"""
    with open("templates/user_management.html", "r", encoding="utf-8") as f:
        return f.read()

@app.get("/services", response_class=HTMLResponse)
async def services_page():
    """Page de gestion des services"""
    with open("templates/services.html", "r", encoding="utf-8") as f:
        return f.read()

@app.get("/purchase-requests", response_class=HTMLResponse)
async def purchase_requests_page():
    """Page de gestion des demandes d'achat"""
    with open("templates/purchase_requests.html", "r", encoding="utf-8") as f:
        return f.read()

@app.get("/purchases", response_class=HTMLResponse)
async def purchases_page():
    """Page de gestion des achats"""
    with open("templates/purchases.html", "r", encoding="utf-8") as f:
        return f.read()

@app.get("/stock", response_class=HTMLResponse)
async def stock_page():
    """Page de gestion du stock"""
    return """
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gestion du Stock</title>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; color: #333; }
            .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .header { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 15px; padding: 30px; margin-bottom: 30px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); text-align: center; }
            .header h1 { color: #2c3e50; font-size: 2.5em; margin-bottom: 10px; }
            .card { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 15px; padding: 30px; margin-bottom: 30px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); }
            .btn { display: inline-block; padding: 12px 25px; background: linear-gradient(45deg, #3498db, #2980b9); color: white; text-decoration: none; border-radius: 25px; font-weight: bold; transition: all 0.3s ease; margin: 5px; border: none; cursor: pointer; }
            .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(52, 152, 219, 0.4); }
            .btn-success { background: linear-gradient(45deg, #27ae60, #229954); }
            .btn-warning { background: linear-gradient(45deg, #f39c12, #e67e22); }
            .btn-danger { background: linear-gradient(45deg, #e74c3c, #c0392b); }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1><i class="fas fa-boxes"></i> Gestion du Stock</h1>
                <p>Contrôlez votre inventaire avec alertes de seuil automatiques</p>
            </div>
            <div class="card">
                <h2><i class="fas fa-plus"></i> Ajouter un Article</h2>
                <p>Fonctionnalité en cours de développement</p>
                <button onclick="alert('Fonctionnalité en cours de développement')" class="btn btn-success">
                    <i class="fas fa-plus"></i> Ajouter Article
                </button>
            </div>
            <div class="card">
                <h2><i class="fas fa-list"></i> Liste du Stock</h2>
                <p>Fonctionnalité en cours de développement</p>
                <button onclick="alert('Fonctionnalité en cours de développement')" class="btn">
                    <i class="fas fa-list"></i> Voir Stock
                </button>
            </div>
        </div>
    </body>
    </html>
    """

@app.get("/vehicles", response_class=HTMLResponse)
async def vehicles_page():
    """Page de gestion des véhicules"""
    return """
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Gestion des Véhicules</title>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; color: #333; }
            .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .header { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 15px; padding: 30px; margin-bottom: 30px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); text-align: center; }
            .header h1 { color: #2c3e50; font-size: 2.5em; margin-bottom: 10px; }
            .card { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 15px; padding: 30px; margin-bottom: 30px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); }
            .btn { display: inline-block; padding: 12px 25px; background: linear-gradient(45deg, #3498db, #2980b9); color: white; text-decoration: none; border-radius: 25px; font-weight: bold; transition: all 0.3s ease; margin: 5px; border: none; cursor: pointer; }
            .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(52, 152, 219, 0.4); }
            .btn-success { background: linear-gradient(45deg, #27ae60, #229954); }
            .btn-warning { background: linear-gradient(45deg, #f39c12, #e67e22); }
            .btn-danger { background: linear-gradient(45deg, #e74c3c, #c0392b); }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1><i class="fas fa-truck"></i> Gestion des Véhicules</h1>
                <p>Gérez l'entretien, le carburant et l'historique de vos véhicules</p>
            </div>
            <div class="card">
                <h2><i class="fas fa-plus"></i> Ajouter un Véhicule</h2>
                <p>Fonctionnalité en cours de développement</p>
                <button onclick="alert('Fonctionnalité en cours de développement')" class="btn btn-danger">
                    <i class="fas fa-plus"></i> Nouveau Véhicule
                </button>
            </div>
            <div class="card">
                <h2><i class="fas fa-list"></i> Liste des Véhicules</h2>
                <p>Fonctionnalité en cours de développement</p>
                <button onclick="alert('Fonctionnalité en cours de développement')" class="btn">
                    <i class="fas fa-list"></i> Voir Véhicules
                </button>
            </div>
        </div>
    </body>
    </html>
    """

@app.get("/reports", response_class=HTMLResponse)
async def reports_page():
    """Page des rapports"""
    return """
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rapports & Analytics</title>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; color: #333; }
            .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .header { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 15px; padding: 30px; margin-bottom: 30px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); text-align: center; }
            .header h1 { color: #2c3e50; font-size: 2.5em; margin-bottom: 10px; }
            .card { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 15px; padding: 30px; margin-bottom: 30px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); }
            .btn { display: inline-block; padding: 12px 25px; background: linear-gradient(45deg, #3498db, #2980b9); color: white; text-decoration: none; border-radius: 25px; font-weight: bold; transition: all 0.3s ease; margin: 5px; border: none; cursor: pointer; }
            .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(52, 152, 219, 0.4); }
            .btn-success { background: linear-gradient(45deg, #27ae60, #229954); }
            .btn-warning { background: linear-gradient(45deg, #f39c12, #e67e22); }
            .btn-danger { background: linear-gradient(45deg, #e74c3c, #c0392b); }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1><i class="fas fa-chart-line"></i> Rapports & Analytics</h1>
                <p>Tableaux de bord interactifs et analyses financières</p>
            </div>
            <div class="card">
                <h2><i class="fas fa-chart-bar"></i> Rapports Financiers</h2>
                <p>Fonctionnalité en cours de développement</p>
                <button onclick="alert('Fonctionnalité en cours de développement')" class="btn">
                    <i class="fas fa-chart-bar"></i> Voir Rapports
                </button>
            </div>
            <div class="card">
                <h2><i class="fas fa-tachometer-alt"></i> Tableau de Bord</h2>
                <p>Fonctionnalité en cours de développement</p>
                <button onclick="window.open('/api/reports/dashboard', '_blank')" class="btn btn-success">
                    <i class="fas fa-tachometer-alt"></i> Tableau de Bord
                </button>
            </div>
        </div>
    </body>
    </html>
    """

@app.on_event("startup")
async def startup_event():
    """Initialisation de l'application au démarrage"""
    init_database()
    print("✅ Système de gestion intégré initialisé avec succès")

@app.get("/stock-movements", response_class=HTMLResponse)
async def stock_movements_page():
    """Page de gestion des mouvements de stock"""
    return """
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mouvements de Stock</title>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; color: #333; }
            .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
            .header { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 15px; padding: 30px; margin-bottom: 30px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); text-align: center; }
            .header h1 { color: #2c3e50; font-size: 2.5em; margin-bottom: 10px; }
            .card { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 15px; padding: 30px; margin-bottom: 30px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); }
            .btn { display: inline-block; padding: 12px 25px; background: linear-gradient(45deg, #3498db, #2980b9); color: white; text-decoration: none; border-radius: 25px; font-weight: bold; transition: all 0.3s ease; margin: 5px; border: none; cursor: pointer; }
            .btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(52, 152, 219, 0.4); }
            .btn-success { background: linear-gradient(45deg, #27ae60, #229954); }
            .btn-warning { background: linear-gradient(45deg, #f39c12, #e67e22); }
            .btn-danger { background: linear-gradient(45deg, #e74c3c, #c0392b); }
            .form-group { margin-bottom: 20px; }
            .form-group label { display: block; margin-bottom: 5px; font-weight: bold; color: #2c3e50; }
            .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px; border: 2px solid #e1e8ed; border-radius: 8px; font-size: 16px; }
            .form-row { display: flex; gap: 20px; }
            .form-row .form-group { flex: 1; }
            .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .table th, .table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
            .table th { background-color: #f8f9fa; font-weight: bold; }
            .status-entry { color: #27ae60; font-weight: bold; }
            .status-exit { color: #e74c3c; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1><i class="fas fa-exchange-alt"></i> Mouvements de Stock</h1>
                <p>Gestion des entrées et sorties de stock</p>
                <a href="/" class="btn"><i class="fas fa-home"></i> Retour à l'Accueil</a>
            </div>
            
            <div class="card">
                <h2><i class="fas fa-plus"></i> Nouveau Mouvement</h2>
                <form id="movement-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="stock_item_id">Article en Stock *</label>
                            <select id="stock_item_id" name="stock_item_id" required>
                                <option value="">Sélectionner un article...</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="movement_type">Type de Mouvement *</label>
                            <select id="movement_type" name="movement_type" required>
                                <option value="">Sélectionner un type...</option>
                                <option value="entry">Entrée de Stock</option>
                                <option value="exit">Sortie de Stock</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="quantity">Quantité *</label>
                            <input type="number" id="quantity" name="quantity" min="1" required>
                        </div>
                        <div class="form-group">
                            <label for="reference">Référence</label>
                            <input type="text" id="reference" name="reference" placeholder="Numéro de commande, bon de sortie...">
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="reason">Raison du Mouvement</label>
                        <textarea id="reason" name="reason" rows="3" placeholder="Décrivez la raison de ce mouvement..."></textarea>
                    </div>
                    
                    <button type="submit" class="btn btn-success">
                        <i class="fas fa-save"></i> Enregistrer le Mouvement
                    </button>
                </form>
            </div>
            
            <div class="card">
                <h2><i class="fas fa-list"></i> Historique des Mouvements</h2>
                <div class="table-actions">
                    <input type="text" id="search" placeholder="Rechercher par article ou référence...">
                    <select id="type-filter">
                        <option value="">Tous les types</option>
                        <option value="entry">Entrées</option>
                        <option value="exit">Sorties</option>
                    </select>
                </div>
                <table class="table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Article</th>
                            <th>Type</th>
                            <th>Quantité</th>
                            <th>Raison</th>
                            <th>Référence</th>
                            <th>Utilisateur</th>
                        </tr>
                    </thead>
                    <tbody id="movements-tbody">
                        <!-- Les mouvements seront chargés ici -->
                    </tbody>
                </table>
            </div>
        </div>
        
        <script>
            let allMovementsData = [];
            let allStockItems = [];
            
            // Charger les données au démarrage
            document.addEventListener('DOMContentLoaded', function() {
                loadStockItems();
                loadMovements();
                attachFormEvents();
            });
            
            // Attacher les événements du formulaire
            function attachFormEvents() {
                const form = document.getElementById('movement-form');
                if (form) {
                    form.addEventListener('submit', function(e) {
                        e.preventDefault();
                        submitMovement();
                    });
                }
            }
            
            // Charger les articles de stock
            async function loadStockItems() {
                try {
                    const token = localStorage.getItem('access_token');
                    const response = await fetch('/api/stock/items', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (response.ok) {
                        allStockItems = await response.json();
                        populateStockItemsSelect();
                    }
                } catch (error) {
                    console.error('Erreur lors du chargement des articles:', error);
                }
            }
            
            function populateStockItemsSelect() {
                const select = document.getElementById('stock_item_id');
                select.innerHTML = '<option value="">Sélectionner un article...</option>';
                
                allStockItems.forEach(item => {
                    const option = document.createElement('option');
                    option.value = item.id;
                    option.textContent = `${item.name} (Stock: ${item.current_quantity} ${item.unit})`;
                    select.appendChild(option);
                });
            }
            
            // Charger les mouvements
            async function loadMovements() {
                try {
                    const token = localStorage.getItem('access_token');
                    const response = await fetch('/api/stock-movements/', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (response.ok) {
                        allMovementsData = await response.json();
                        displayMovements(allMovementsData);
                    }
                } catch (error) {
                    console.error('Erreur lors du chargement des mouvements:', error);
                }
            }
            
            function displayMovements(movements) {
                const tbody = document.getElementById('movements-tbody');
                tbody.innerHTML = '';
                
                movements.forEach(movement => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${new Date(movement.created_at).toLocaleDateString('fr-FR')}</td>
                        <td>${getStockItemName(movement.stock_item_id)}</td>
                        <td><span class="status-${movement.movement_type}">${movement.movement_type === 'entry' ? 'Entrée' : 'Sortie'}</span></td>
                        <td>${movement.quantity}</td>
                        <td>${movement.reason || '-'}</td>
                        <td>${movement.reference || '-'}</td>
                        <td>${movement.user_id || '-'}</td>
                    `;
                    tbody.appendChild(row);
                });
            }
            
            function getStockItemName(stockItemId) {
                const item = allStockItems.find(item => item.id === stockItemId);
                return item ? item.name : 'Article inconnu';
            }
            
            // Soumettre un nouveau mouvement
            async function submitMovement() {
                const form = document.getElementById('movement-form');
                const formData = new FormData(form);
                
                const movementData = {
                    stock_item_id: parseInt(formData.get('stock_item_id')),
                    movement_type: formData.get('movement_type'),
                    quantity: parseInt(formData.get('quantity')),
                    reason: formData.get('reason') || null,
                    reference: formData.get('reference') || null
                };
                
                try {
                    const token = localStorage.getItem('access_token');
                    const response = await fetch('/api/stock-movements/', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify(movementData)
                    });
                    
                    if (response.ok) {
                        alert('Mouvement enregistré avec succès !');
                        form.reset();
                        loadMovements();
                        loadStockItems(); // Recharger pour mettre à jour les quantités
                    } else {
                        const error = await response.json();
                        alert('Erreur: ' + (error.detail || 'Erreur inconnue'));
                    }
                } catch (error) {
                    console.error('Erreur:', error);
                    alert('Erreur de connexion');
                }
            }
            
            // Filtrage
            document.getElementById('search').addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const filteredMovements = allMovementsData.filter(movement => {
                    const itemName = getStockItemName(movement.stock_item_id).toLowerCase();
                    const reference = (movement.reference || '').toLowerCase();
                    return itemName.includes(searchTerm) || reference.includes(searchTerm);
                });
                displayMovements(filteredMovements);
            });
            
            document.getElementById('type-filter').addEventListener('change', function() {
                const typeFilter = this.value;
                const filteredMovements = typeFilter ? 
                    allMovementsData.filter(movement => movement.movement_type === typeFilter) : 
                    allMovementsData;
                displayMovements(filteredMovements);
            });
        </script>
    </body>
    </html>
    """

# Point d'entrée pour lancer l'application
if __name__ == "__main__":
    from deployment_config import HOST, PORT, DEBUG
    
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=DEBUG  # Rechargement automatique seulement en développement
    )
