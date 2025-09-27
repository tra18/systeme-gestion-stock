#!/usr/bin/env python3
"""
Script pour générer le hash du mot de passe admin
"""
from passlib.context import CryptContext

# Utiliser le même contexte que l'application
pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

password = "admin123"
hashed = pwd_context.hash(password)

print(f"Mot de passe: {password}")
print(f"Hash généré: {hashed}")
print("\nUtilisez ce hash dans create_admin.py")
