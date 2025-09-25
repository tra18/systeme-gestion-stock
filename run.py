#!/usr/bin/env python3
"""
Script de lancement pour l'application FastAPI
Utilise uvicorn pour servir l'application avec des options optimisées
"""

import uvicorn
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

if __name__ == "__main__":
    # Configuration du serveur
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "True").lower() == "true"
    
    print(f"🚀 Démarrage de l'application sur http://{host}:{port}")
    print(f"📚 Documentation disponible sur http://{host}:{port}/docs")
    print(f"🔄 Mode debug: {'Activé' if debug else 'Désactivé'}")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=debug,
        log_level="info" if debug else "warning"
    )

