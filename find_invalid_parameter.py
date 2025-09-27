#!/usr/bin/env python3
"""
Script pour identifier le paramètre 'not' invalide
"""

import ast
import os
import sys

def find_invalid_parameters():
    print("🔍 Recherche du paramètre 'not' invalide")
    print("=" * 50)
    
    python_files = []
    
    # Trouver tous les fichiers Python
    for root, dirs, files in os.walk('.'):
        for file in files:
            if file.endswith('.py'):
                python_files.append(os.path.join(root, file))
    
    print(f"📁 {len(python_files)} fichiers Python trouvés")
    
    for file_path in python_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Parser le fichier
            tree = ast.parse(content)
            
            # Chercher les fonctions avec des paramètres 'not'
            for node in ast.walk(tree):
                if isinstance(node, ast.FunctionDef):
                    for arg in node.args.args:
                        if arg.arg == 'not':
                            print(f"❌ FICHIER: {file_path}")
                            print(f"   FONCTION: {node.name}")
                            print(f"   LIGNE: {node.lineno}")
                            print(f"   PARAMÈTRE INVALIDE: 'not'")
                            print()
                            return file_path, node.name, node.lineno
                
                # Chercher aussi dans les annotations de type
                if isinstance(node, ast.FunctionDef):
                    for arg in node.args.args:
                        if hasattr(arg, 'annotation') and arg.annotation:
                            if isinstance(arg.annotation, ast.Name) and arg.annotation.id == 'not':
                                print(f"❌ FICHIER: {file_path}")
                                print(f"   FONCTION: {node.name}")
                                print(f"   LIGNE: {node.lineno}")
                                print(f"   ANNOTATION INVALIDE: 'not'")
                                print()
                                return file_path, node.name, node.lineno
        
        except Exception as e:
            print(f"⚠️  Erreur lors de l'analyse de {file_path}: {e}")
    
    print("✅ Aucun paramètre 'not' trouvé dans les définitions de fonctions")
    print("🔍 Le problème peut venir d'un autre endroit...")
    
    return None, None, None

if __name__ == "__main__":
    find_invalid_parameters()
