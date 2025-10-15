# 🤝 Guide de Contribution - VITACH GUINÉE

Merci de votre intérêt à contribuer au système VITACH GUINÉE ! Ce guide vous aidera à comprendre comment contribuer efficacement au projet.

## 📋 Table des Matières

- [🚀 Démarrage rapide](#-démarrage-rapide)
- [🔧 Configuration de l'environnement](#-configuration-de-lenvironnement)
- [📝 Standards de code](#-standards-de-code)
- [🔄 Workflow de contribution](#-workflow-de-contribution)
- [🧪 Tests](#-tests)
- [📚 Documentation](#-documentation)
- [🐛 Signaler des bugs](#-signaler-des-bugs)
- [✨ Proposer des fonctionnalités](#-proposer-des-fonctionnalités)

## 🚀 Démarrage rapide

### 1. Fork et Clone
```bash
# Fork le projet sur GitHub, puis clonez votre fork
git clone https://github.com/VOTRE-USERNAME/systeme-gestion-stock.git
cd systeme-gestion-stock

# Ajoutez le dépôt original comme remote
git remote add upstream https://github.com/tra18/systeme-gestion-stock.git
```

### 2. Installation
```bash
# Installez les dépendances
npm install

# Configurez Firebase (voir section configuration)
cp src/firebase/config.example.js src/firebase/config.js
```

### 3. Développement
```bash
# Lancez le serveur de développement
npm start

# Dans un autre terminal, lancez les tests
npm test
```

## 🔧 Configuration de l'environnement

### Firebase
1. Créez un projet Firebase
2. Activez Authentication, Firestore, et Storage
3. Copiez les clés de configuration dans `src/firebase/config.js`

### Variables d'environnement
Créez un fichier `.env.local` :
```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## 📝 Standards de code

### Structure des fichiers
```
src/
├── components/          # Composants réutilisables
│   ├── [module]/       # Groupés par module
│   └── layout/         # Layout et navigation
├── pages/              # Pages principales
├── contexts/           # Contextes React
├── utils/              # Utilitaires
└── firebase/           # Configuration Firebase
```

### Conventions de nommage
- **Composants** : `PascalCase` (ex: `UserProfile.js`)
- **Fichiers** : `camelCase` (ex: `userProfile.js`)
- **Variables** : `camelCase` (ex: `userName`)
- **Constantes** : `UPPER_SNAKE_CASE` (ex: `API_BASE_URL`)

### Format de code
```javascript
// ✅ Bon exemple
const UserProfile = ({ user, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      await onUpdate(user);
    } catch (error) {
      console.error('Erreur mise à jour:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <button 
        onClick={handleUpdate}
        disabled={isLoading}
        className="btn btn-primary"
      >
        {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
      </button>
    </div>
  );
};
```

### Commentaires
```javascript
/**
 * Composant de profil utilisateur
 * @param {Object} user - Données utilisateur
 * @param {Function} onUpdate - Callback de mise à jour
 * @returns {JSX.Element} Composant React
 */
const UserProfile = ({ user, onUpdate }) => {
  // État local pour le chargement
  const [isLoading, setIsLoading] = useState(false);
  
  // Gestionnaire de mise à jour
  const handleUpdate = async () => {
    // Logique de mise à jour...
  };
};
```

## 🔄 Workflow de contribution

### 1. Créer une branche
```bash
# Récupérez les dernières modifications
git fetch upstream
git checkout main
git merge upstream/main

# Créez une nouvelle branche
git checkout -b feature/nom-de-votre-fonctionnalite
```

### 2. Développer
- Écrivez du code propre et testé
- Suivez les conventions du projet
- Documentez vos changements

### 3. Commit
```bash
# Ajoutez vos modifications
git add .

# Commitez avec un message descriptif
git commit -m "feat: ajouter gestion des notifications push

- Ajout du composant NotificationCenter
- Intégration avec Firebase Messaging
- Interface utilisateur responsive
- Tests unitaires inclus"
```

### 4. Push et Pull Request
```bash
# Push vers votre fork
git push origin feature/nom-de-votre-fonctionnalite

# Créez une Pull Request sur GitHub
```

## 🧪 Tests

### Types de tests
- **Unitaires** : Tests des fonctions individuelles
- **Intégration** : Tests des composants ensemble
- **E2E** : Tests de bout en bout

### Lancer les tests
```bash
# Tous les tests
npm test

# Tests en mode watch
npm test -- --watch

# Tests avec coverage
npm test -- --coverage
```

### Écrire des tests
```javascript
// UserProfile.test.js
import { render, screen, fireEvent } from '@testing-library/react';
import UserProfile from './UserProfile';

describe('UserProfile', () => {
  const mockUser = { name: 'John Doe', email: 'john@example.com' };
  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    mockOnUpdate.mockClear();
  });

  it('affiche le nom de l\'utilisateur', () => {
    render(<UserProfile user={mockUser} onUpdate={mockOnUpdate} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('appelle onUpdate au clic du bouton', async () => {
    render(<UserProfile user={mockUser} onUpdate={mockOnUpdate} />);
    
    const button = screen.getByText('Mettre à jour');
    fireEvent.click(button);
    
    expect(mockOnUpdate).toHaveBeenCalledWith(mockUser);
  });
});
```

## 📚 Documentation

### Mise à jour de la documentation
- **README.md** : Vue d'ensemble et installation
- **CONTRIBUTING.md** : Guide de contribution (ce fichier)
- **Comments** : Documentation du code
- **Wiki** : Documentation détaillée

### Format de documentation
```javascript
/**
 * Calcule le total des salaires pour une période donnée
 * @param {Array} employes - Liste des employés
 * @param {Date} dateDebut - Date de début de la période
 * @param {Date} dateFin - Date de fin de la période
 * @returns {number} Total des salaires
 * @throws {Error} Si les dates sont invalides
 * 
 * @example
 * const total = calculerTotalSalaires(employes, new Date('2024-01-01'), new Date('2024-01-31'));
 * console.log(`Total: ${total} GNF`);
 */
const calculerTotalSalaires = (employes, dateDebut, dateFin) => {
  // Implémentation...
};
```

## 🐛 Signaler des bugs

### Avant de signaler
1. Vérifiez les issues existantes
2. Testez sur la dernière version
3. Rassemblez les informations nécessaires

### Template de bug report
Utilisez le template fourni dans `.github/ISSUE_TEMPLATE/bug_report.md`

### Informations importantes
- **Environnement** : OS, navigateur, version
- **Étapes de reproduction** : Détaillez chaque étape
- **Comportement attendu vs actuel**
- **Logs d'erreur** : Capturez les erreurs console
- **Captures d'écran** : Si applicable

## ✨ Proposer des fonctionnalités

### Avant de proposer
1. Vérifiez les feature requests existantes
2. Considérez l'impact sur l'architecture
3. Pensez aux cas d'usage

### Template de feature request
Utilisez le template fourni dans `.github/ISSUE_TEMPLATE/feature_request.md`

### Éléments importants
- **Problème à résoudre** : Décrivez le besoin
- **Solution proposée** : Votre idée
- **Alternatives** : Autres solutions possibles
- **Priorité** : Impact et urgence
- **Module concerné** : Où intégrer la fonctionnalité

## 🏷️ Labels et conventions

### Labels d'issues
- `bug` : Problème à corriger
- `enhancement` : Nouvelle fonctionnalité
- `question` : Question d'utilisation
- `documentation` : Amélioration de la doc
- `good first issue` : Bon pour débuter

### Labels de PR
- `ready for review` : Prêt pour review
- `work in progress` : En cours de développement
- `breaking change` : Changement majeur
- `dependencies` : Mise à jour de dépendances

## 🔍 Processus de review

### Critères de review
- ✅ Code fonctionnel et testé
- ✅ Respect des conventions
- ✅ Documentation à jour
- ✅ Pas de régression
- ✅ Performance acceptable

### Répondre aux commentaires
- Soyez constructif et professionnel
- Demandez des clarifications si nécessaire
- Testez les suggestions avant d'appliquer

## 📞 Support

### Questions et aide
- 💬 **GitHub Discussions** : Pour les questions générales
- 🐛 **Issues** : Pour les bugs et fonctionnalités
- 📧 **Email** : support@vitach-guinee.com

### Ressources
- 📚 **Documentation** : [Wiki du projet](wiki/)
- 🎥 **Tutoriels** : [Vidéos de formation](tutorials/)
- 💡 **FAQ** : [Questions fréquentes](faq/)

## 🙏 Remerciements

Merci à tous les contributeurs qui participent à l'amélioration de VITACH GUINÉE !

### Contributors
Voir [CONTRIBUTORS.md](CONTRIBUTORS.md) pour la liste complète.

---

**Note** : Ce guide est vivant et évolue avec le projet. N'hésitez pas à proposer des améliorations !