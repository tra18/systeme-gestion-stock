from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
import uvicorn

# Création de l'application FastAPI simplifiée
app = FastAPI(
    title="Système de Gestion Intégré",
    description="Gestion complète des achats, stock et logistique",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route de santé
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "message": "Système de Gestion Intégré - Opérationnel",
        "version": "2.0.0"
    }

# Route principale
@app.get("/", response_class=HTMLResponse)
async def root():
    return """
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Système de Gestion Intégré</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0;
            }
            .container {
                text-align: center;
                max-width: 600px;
                padding: 2rem;
            }
            h1 { font-size: 3rem; margin-bottom: 1rem; }
            .btn {
                background: rgba(255,255,255,0.2);
                border: 2px solid rgba(255,255,255,0.3);
                color: white;
                padding: 1rem 2rem;
                text-decoration: none;
                border-radius: 50px;
                margin: 0.5rem;
                display: inline-block;
            }
            .btn:hover { background: rgba(255,255,255,0.3); }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🏢 Système de Gestion Intégré</h1>
            <p>Gestion complète des achats, stock et logistique</p>
            
            <div>
                <a href="/api/docs" class="btn">📚 Documentation API</a>
                <a href="/health" class="btn">🔍 État du Système</a>
            </div>
            
            <div style="margin-top: 2rem; padding: 1rem; background: rgba(255,255,255,0.1); border-radius: 10px;">
                <h3>✅ Application Déployée avec Succès</h3>
                <p>Version 2.0.0 - Railway</p>
            </div>
        </div>
    </body>
    </html>
    """

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)