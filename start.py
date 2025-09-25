#!/usr/bin/env python3
"""
Script de démarrage pour Railway
"""

import os
import uvicorn

if __name__ == "__main__":
    # Configuration pour Railway
    host = "0.0.0.0"
    port = int(os.getenv("PORT", 8000))
    
    print(f"🚀 Démarrage de l'application sur {host}:{port}")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        workers=1,
        log_level="info"
    )
