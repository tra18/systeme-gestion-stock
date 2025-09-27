"""
Point d'entrée Vercel pour l'application FastAPI
"""
import sys
import os

# Ajouter le répertoire parent au path pour importer les modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Importer l'application FastAPI
from main import app

# Handler pour Vercel
def handler(request):
    return app(request.environ, request.start_response)

# Export pour Vercel
app = app

