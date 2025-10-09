# 🤝 Guide de Contribution - VITACH GUINÉE

Merci de votre intérêt à contribuer au projet VITACH GUINÉE ! Ce guide vous aidera à comprendre comment contribuer efficacement.

## 📋 Table des Matières

- [Code de Conduite](#code-de-conduite)
- [Comment Contribuer](#comment-contribuer)
- [Processus de Développement](#processus-de-développement)
- [Standards de Code](#standards-de-code)
- [Tests](#tests)
- [Documentation](#documentation)

## 📜 Code de Conduite

### Nos Engagements

Nous nous engageons à créer un environnement accueillant et inclusif pour tous les contributeurs, indépendamment de :

- L'âge, la taille, le handicap, l'ethnicité
- L'identité et l'expression de genre
- Le niveau d'expérience, l'éducation
- L'apparence, la nationalité
- L'orientation sexuelle, l'identité sociale

### Comportements Acceptables

- Utiliser un langage accueillant et inclusif
- Respecter les points de vue et expériences différents
- Accepter gracieusement les critiques constructives
- Se concentrer sur ce qui est le mieux pour la communauté
- Faire preuve d'empathie envers les autres membres

### Comportements Inacceptables

- L'utilisation de langage ou d'images sexualisés
- Le trolling, les commentaires insultants ou désobligeants
- Le harcèlement public ou privé
- La publication d'informations privées sans permission
- Toute conduite inappropriée dans un contexte professionnel

## 🚀 Comment Contribuer

### 1. Fork et Clone

```bash
# Fork le repository sur GitHub
# Puis clonez votre fork
git clone https://github.com/VOTRE-USERNAME/vitach-guinee.git
cd vitach-guinee
```

### 2. Créer une Branche

```bash
# Créer une nouvelle branche pour votre fonctionnalité
git checkout -b feature/nom-de-votre-fonctionnalite
# ou
git checkout -b fix/nom-du-bug
```

### 3. Installer les Dépendances

```bash
# Installer les dépendances
pip install -r requirements.txt
```

### 4. Développer

- Suivez les standards de code
- Ajoutez des tests pour vos modifications
- Mettez à jour la documentation si nécessaire

### 5. Tester

```bash
# Lancer les tests
python -m pytest

# Vérifier le style de code
flake8 .

# Vérifier la sécurité
safety check
```

### 6. Commit et Push

```bash
# Ajouter vos modifications
git add .

# Commit avec un message descriptif
git commit -m "feat: ajouter nouvelle fonctionnalité X"

# Push vers votre fork
git push origin feature/nom-de-votre-fonctionnalite
```

### 7. Pull Request

- Créer une Pull Request sur GitHub
- Décrire clairement vos modifications
- Référencer les issues liées
- Attendre la review

## 🔄 Processus de Développement

### Branches

- `main` : Branche principale, code stable
- `develop` : Branche de développement
- `feature/*` : Nouvelles fonctionnalités
- `fix/*` : Corrections de bugs
- `hotfix/*` : Corrections urgentes

### Workflow

1. **Issue** : Créer une issue pour décrire le problème/fonctionnalité
2. **Branch** : Créer une branche depuis `develop`
3. **Develop** : Développer et tester
4. **PR** : Créer une Pull Request vers `develop`
5. **Review** : Code review et tests
6. **Merge** : Fusion dans `develop`
7. **Release** : Fusion dans `main` pour release

## 📝 Standards de Code

### Python

- Suivre PEP 8
- Utiliser des noms de variables descriptifs
- Ajouter des docstrings pour les fonctions
- Maximum 120 caractères par ligne

```python
def calculate_total_price(quantity: int, unit_price: float) -> float:
    """
    Calcule le prix total d'un achat.
    
    Args:
        quantity: Quantité d'articles
        unit_price: Prix unitaire
        
    Returns:
        Prix total calculé
    """
    return quantity * unit_price
```

### JavaScript

- Utiliser des noms de variables descriptifs
- Commenter le code complexe
- Utiliser des fonctions async/await pour les appels API

```javascript
async function loadServices() {
    try {
        const response = await fetch('/api/services/');
        const services = await response.json();
        displayServices(services);
    } catch (error) {
        console.error('Erreur lors du chargement des services:', error);
    }
}
```

### HTML/CSS

- Utiliser une indentation cohérente
- Ajouter des commentaires pour les sections importantes
- Utiliser des classes CSS descriptives

## 🧪 Tests

### Types de Tests

- **Tests unitaires** : Fonctions individuelles
- **Tests d'intégration** : Modules ensemble
- **Tests fonctionnels** : Interface utilisateur

### Exécuter les Tests

```bash
# Tous les tests
python -m pytest

# Tests spécifiques
python -m pytest tests/test_purchases.py

# Avec couverture
python -m pytest --cov=.
```

### Écrire des Tests

```python
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_create_purchase():
    response = client.post(
        "/api/purchases/",
        json={
            "item_name": "Test Item",
            "quantity": 10,
            "unit_price": 100.0,
            "category": "equipment"
        }
    )
    assert response.status_code == 200
    assert response.json()["item_name"] == "Test Item"
```

## 📚 Documentation

### Types de Documentation

- **README.md** : Vue d'ensemble du projet
- **API Documentation** : Documentation des endpoints
- **Code Comments** : Commentaires dans le code
- **User Guide** : Guide utilisateur

### Mettre à Jour la Documentation

- Mettre à jour le README pour les nouvelles fonctionnalités
- Ajouter des exemples d'utilisation
- Documenter les changements d'API
- Mettre à jour les guides utilisateur

## 🐛 Signaler un Bug

### Template d'Issue

```markdown
**Description du Bug**
Description claire du problème.

**Étapes pour Reproduire**
1. Aller à '...'
2. Cliquer sur '....'
3. Voir l'erreur

**Comportement Attendu**
Description du comportement attendu.

**Captures d'Écran**
Si applicable, ajouter des captures d'écran.

**Environnement**
- OS: [ex: Windows, macOS, Linux]
- Navigateur: [ex: Chrome, Firefox]
- Version: [ex: 1.0.0]

**Informations Supplémentaires**
Toute autre information pertinente.
```

## ✨ Proposer une Fonctionnalité

### Template de Feature Request

```markdown
**Fonctionnalité Demandée**
Description claire de la fonctionnalité.

**Problème Résolu**
Quel problème cette fonctionnalité résout-elle ?

**Solution Proposée**
Description de la solution proposée.

**Alternatives Considérées**
Autres solutions considérées.

**Contexte Supplémentaire**
Toute autre information pertinente.
```

## 📞 Support

### Obtenir de l'Aide

- **Issues GitHub** : Pour les bugs et fonctionnalités
- **Discussions** : Pour les questions générales
- **Email** : Pour les questions privées

### Ressources

- [Documentation FastAPI](https://fastapi.tiangolo.com/)
- [Documentation SQLAlchemy](https://docs.sqlalchemy.org/)
- [Guide Python](https://docs.python.org/)

## 🏆 Reconnaissance

Les contributeurs seront reconnus dans :

- Le fichier CONTRIBUTORS.md
- Les release notes
- La documentation du projet

## 📄 Licence

En contribuant, vous acceptez que vos contributions soient sous la même licence que le projet (MIT License).

---

**Merci de contribuer à VITACH GUINÉE !** 🎉

*Dernière mise à jour : 25 Septembre 2025*


