#!/usr/bin/env python3
"""
Script de démarrage ultra-simple pour Railway
"""

import os
import sys
import uvicorn

if __name__ == "__main__":
    # Configuration minimale
    host = "0.0.0.0"
    port = int(os.getenv("PORT", 8000))
    
    print(f"🚀 Démarrage sur {host}:{port}")
    print(f"🐍 Python version: {sys.version}")
    print(f"📁 Working directory: {os.getcwd()}")
    
    # Démarrage simple sans options complexes
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        log_level="info"
    )
