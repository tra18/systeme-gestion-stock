#!/usr/bin/env python3
"""
Script de démarrage ultra-simple pour Railway
"""

import os
import uvicorn

if __name__ == "__main__":
    # Configuration minimale
    host = "0.0.0.0"
    port = int(os.getenv("PORT", 8000))
    
    print(f"🚀 Démarrage sur {host}:{port}")
    
    # Démarrage simple sans options complexes
    uvicorn.run(
        "main:app",
        host=host,
        port=port
    )
