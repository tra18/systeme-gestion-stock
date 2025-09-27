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
                <a href="/api/login" class="btn">🔐 Connexion</a>
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
    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation de la base de données: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
