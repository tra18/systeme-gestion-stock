# 🔐 Guide de Gestion des Permissions

## Vue d'ensemble

Le système de gestion des permissions permet au **Directeur Général (DG)** de contrôler précisément quelles pages chaque utilisateur peut accéder dans l'application.

---

## 🎯 Accès à la page

**Menu** : `Gestion Permissions` (icône bouclier 🛡️)

**Rôle requis** : Directeur Général (DG) uniquement

**URL** : `/gestion-permissions`

---

## 📋 Fonctionnalités

### 1️⃣ Liste des Utilisateurs

**Panneau gauche** affiche tous les utilisateurs avec :
- **Nom complet** et **email**
- **Badge de rôle** (couleur selon le rôle)
- **Compteur de permissions** (nombre de pages accessibles)
- **Barre de recherche** pour filtrer par nom ou email
- **Bouton Actualiser** pour recharger la liste

### 2️⃣ Panneau de Permissions

**Panneau droit** affiche les permissions de l'utilisateur sélectionné avec :
- **En-tête utilisateur** : nom, email, rôle
- **Statistiques** : nombre d'accès autorisés vs refusés
- **Pages organisées par catégorie** (9 catégories)
- **Boutons par catégorie** : 
  - "Tout sélectionner" (vert)
  - "Tout désélectionner" (rouge)
- **Toggle individuel** : cliquer sur une page pour activer/désactiver
- **Bouton Enregistrer** (en haut et en bas)

---

## 📦 Catégories de Pages

### Principal
- Tableau de bord

### Commandes
- Nouvelle Commande
- Service Achat
- Validation DG
- Liste Commandes

### Véhicules
- Maintenance

### Inventaire
- Gestion Stock
- Articles

### Organisation
- Services
- Employés

### RH (Ressources Humaines)
- Ressources Humaines

### Finance
- Budgets

### Analyse
- Rapports

### Partenaires
- Fournisseurs
- Prestataires

### Notifications
- Alertes

### Système
- Paramètres

### Avancé
- Dashboard Avancé
- Mode Hors Ligne

### Administration
- Gestion Permissions

---

## 🔄 Comment Utiliser

### Étape 1 : Sélectionner un utilisateur

1. Ouvrir la page **Gestion Permissions**
2. Utiliser la **barre de recherche** pour trouver un utilisateur (optionnel)
3. **Cliquer** sur l'utilisateur dans la liste de gauche
4. Le panneau de droite affiche ses permissions actuelles

### Étape 2 : Modifier les permissions

**Option A - Par catégorie** :
- Cliquer sur **"Tout sélectionner"** pour donner accès à toutes les pages d'une catégorie
- Cliquer sur **"Tout désélectionner"** pour retirer l'accès à toutes les pages d'une catégorie

**Option B - Page par page** :
- Cliquer sur une **page individuelle** pour activer/désactiver l'accès
- 🔓 **Icône cadenas ouvert** = Accès autorisé (carte verte)
- 🔒 **Icône cadenas fermé** = Accès refusé (carte grise)

### Étape 3 : Enregistrer

1. Cliquer sur le bouton **"Enregistrer"** (violet)
2. Un message de confirmation apparaît : ✅ "Permissions mises à jour pour [Nom]"
3. Les permissions sont **appliquées immédiatement**
4. L'utilisateur verra ses changements au prochain chargement de page

---

## 🎨 Codes Couleur

### Rôles
- 🟣 **Violet** : Directeur Général (DG)
- 🔵 **Bleu** : Service Achat
- 🟢 **Vert** : Service

### Permissions
- 🟢 **Carte verte** avec 🔓 : Accès autorisé
- ⚪ **Carte grise** avec 🔒 : Accès refusé

---

## 🔐 Système de Permissions

### Priorité des permissions

Le système vérifie dans cet ordre :

1. **Permissions personnalisées** (définies dans cette page)
   - Si `permissions[pageId] = true` → ✅ Accès autorisé
   - Si `permissions[pageId] = false` → ❌ Accès refusé

2. **Rôles par défaut** (si aucune permission personnalisée)
   - Le système utilise les rôles standards (DG, Achat, Service)

### Exemple

**Utilisateur** : Jean Dupont (rôle : Service)

**Permissions par défaut** (sans gestion personnalisée) :
- ✅ Tableau de bord
- ✅ Nouvelle Commande
- ✅ Commandes
- ❌ Service Achat (réservé à Achat)
- ❌ Validation DG (réservé à DG)
- etc.

**Avec permissions personnalisées** (DG décide) :
- Le DG peut **autoriser** Jean à accéder à "Service Achat"
- Le DG peut **refuser** à Jean l'accès à "Nouvelle Commande"
- Les permissions personnalisées **remplacent** les permissions par défaut

---

## 💾 Stockage des Permissions

Les permissions sont stockées dans **Firestore** :

```javascript
Collection: users
Document: {userId}
Champ: permissions: {
  "dashboard": true,
  "nouvelle-commande": true,
  "service-achat": false,
  "validation-dg": false,
  ...
}
```

---

## 🚨 Cas Particuliers

### 1. Utilisateur sans permissions définies
- Le système utilise les **rôles par défaut**
- Aucun problème, tout fonctionne normalement

### 2. DG retire ses propres accès
- ⚠️ **Attention** : Un DG peut se bloquer lui-même
- **Solution** : Se reconnecter ou demander à un autre DG de restaurer

### 3. Utilisateur déconnecté
- Les permissions sont rechargées au **prochain login**
- Pas besoin de forcer la déconnexion

### 4. Nouvelle page ajoutée
- Ajouter la page dans la liste `availablePages` de `GestionPermissions.js`
- Définir le `pageId` dans la route du composant `ProtectedRoute`

---

## 🔧 Configuration Technique

### Ajouter une nouvelle page au système

1. **Dans GestionPermissions.js** :
```javascript
const availablePages = [
  { id: 'ma-nouvelle-page', name: 'Ma Nouvelle Page', category: 'Catégorie' },
  ...
];
```

2. **Dans App.js (route)** :
```javascript
<Route 
  path="ma-nouvelle-page" 
  element={
    <ProtectedRoute allowedRoles={['dg']} pageId="ma-nouvelle-page">
      <MaNouvellePageComponent />
    </ProtectedRoute>
  } 
/>
```

3. **Dans Sidebar.js (menu)** :
```javascript
{ name: 'Ma Nouvelle Page', href: '/ma-nouvelle-page', icon: MonIcone, roles: ['dg'] }
```

---

## 📊 Statistiques

En haut du panneau de permissions, vous voyez :
- 🔓 **Accès autorisé** : Nombre de pages accessibles
- 🔒 **Accès refusé** : Nombre de pages bloquées

Cela permet de voir rapidement le niveau d'accès d'un utilisateur.

---

## ✅ Bonnes Pratiques

### 1. Principe du moindre privilège
- Ne donner accès qu'aux pages **nécessaires** pour le travail de l'utilisateur
- Éviter de donner accès à toutes les pages par défaut

### 2. Documentation des changements
- Garder une trace des modifications importantes
- Communiquer avec l'utilisateur avant de retirer des accès

### 3. Révision régulière
- Vérifier périodiquement les permissions de chaque utilisateur
- Retirer les accès inutilisés

### 4. Test après modification
- Demander à l'utilisateur de tester après un changement majeur
- Vérifier qu'il peut accéder aux pages nécessaires

### 5. Sauvegarde avant changement majeur
- Noter les permissions actuelles avant une réorganisation importante

---

## 🆘 Dépannage

### Problème : L'utilisateur ne voit pas ses nouvelles permissions

**Solution** :
1. Demander à l'utilisateur de **se déconnecter**
2. Se **reconnecter**
3. Vérifier dans la console développeur (F12) :
   ```javascript
   // Dans Firestore
   users/{userId}/permissions
   ```

### Problème : Impossible d'enregistrer les permissions

**Erreur** : "Erreur lors de la sauvegarde"

**Solutions** :
1. Vérifier que vous êtes connecté en tant que **DG**
2. Vérifier votre **connexion Internet**
3. Vérifier les **règles Firestore** (doivent permettre au DG de modifier users)
4. Recharger la page et réessayer

### Problème : Un utilisateur accède à une page interdite

**Solutions** :
1. Vérifier ses **permissions personnalisées** dans Gestion Permissions
2. Vérifier son **rôle** dans la collection users
3. Si le problème persiste, le **forcer à se déconnecter** et se reconnecter

---

## 🔒 Sécurité

### Règles Firestore

Les règles sont configurées pour :
- ✅ Permettre au **DG uniquement** de modifier les permissions
- ✅ Chaque utilisateur peut **lire** ses propres permissions
- ❌ Les utilisateurs ne peuvent **pas modifier** leurs propres permissions
- ❌ Les non-DG ne peuvent **pas modifier** les permissions des autres

### Protection côté client

- Le composant `ProtectedRoute` vérifie les permissions avant d'afficher une page
- Si accès refusé → redirection vers `/dashboard`

### Protection côté serveur

- Les règles Firestore valident toutes les opérations
- Même si un utilisateur contourne le client, le serveur refuse

---

## 📞 Support

En cas de problème avec le système de permissions :

1. Vérifier ce guide
2. Vérifier les règles Firestore
3. Vérifier la console développeur (F12) pour les erreurs
4. Contacter le support technique si le problème persiste

---

**Date de création** : 2025-10-09
**Version** : 1.0
**Auteur** : Système de Gestion de Stock

