# 📊 Guide du Module de Gestion des Ressources Humaines

## ✅ Fonctionnalités Implémentées

Votre application dispose maintenant d'un système complet de gestion des ressources humaines avec les modules suivants :

### 1. 📈 **Tableau de Bord RH**
- Vue d'ensemble avec statistiques clés
- Graphiques de présence sur 7 jours
- Demandes de congés récentes
- Évaluations à venir
- Masse salariale en temps réel

### 2. 📅 **Gestion des Congés**
- Création de demandes de congés
- Types : Congé annuel, maladie, sans solde, maternité, paternité, exceptionnel
- Approbation/Refus des demandes
- Filtrage par statut (en attente, approuvé, refusé)
- Calcul automatique de la durée
- Historique complet

### 3. ⏰ **Gestion des Présences**
- Pointage quotidien des employés
- Pointage rapide pour tous les employés actifs
- Statuts : Présent, Absent, Retard, Absent justifié
- Enregistrement des heures d'arrivée et de départ
- Statistiques quotidiennes
- Vue par date

### 4. 💰 **Gestion des Salaires**
- Enregistrement des paiements
- Calcul salaire net (base + primes - déductions)
- Méthodes de paiement : Virement, Espèces, Chèque, Mobile Money
- Filtrage par mois
- Statistiques : masse salariale, moyenne, nombre de paiements
- Génération de bulletins de paie (simulé)

### 5. ⭐ **Évaluations de Performance**
- Évaluation multi-critères (5 critères)
- Types : annuelle, trimestrielle, probatoire, projet, compétences
- Notation de 1 à 5 avec demi-points
- Commentaires et objectifs
- Visualisation graphique des notes
- Statistiques de performance

### 6. 👥 **Gestion des Employés**
- Liste complète des employés
- Informations : poste, département, salaire, statut
- Interface intégrée au module RH

## 🚀 Utilisation

### Accès au Module RH

1. **Connexion** : Connectez-vous en tant que Directeur Général (DG)
2. **Navigation** : Cliquez sur "Ressources Humaines" dans le menu latéral
3. **Onglets** : Naviguez entre les différents modules via les onglets

### Initialisation des Données

Pour tester le module avec des données d'exemple :

1. Ouvrez le fichier `init-donnees-rh.html` dans votre navigateur
2. Assurez-vous d'avoir des employés créés dans le système
3. Cliquez sur "Initialiser toutes les données RH"
4. Le script créera automatiquement :
   - 10 demandes de congés
   - Présences pour les 7 derniers jours
   - Historique de salaires (3 mois)
   - Évaluations de performance

### Workflow Typique

#### 1. Gestion quotidienne des présences
```
1. Accéder à l'onglet "Présences"
2. Sélectionner la date du jour (par défaut)
3. Cliquer sur "Pointage rapide" pour pointer tous les employés actifs
4. Ou pointer individuellement avec "Pointer"
5. Modifier les statuts si nécessaire (retards, absences)
```

#### 2. Traitement des demandes de congés
```
1. Accéder à l'onglet "Congés"
2. Filtrer par "En attente"
3. Consulter les demandes
4. Approuver ou Refuser avec les boutons correspondants
```

#### 3. Paiement mensuel des salaires
```
1. Accéder à l'onglet "Salaires"
2. Cliquer sur "Nouveau paiement"
3. Sélectionner l'employé (le salaire de base est pré-rempli)
4. Ajouter les primes et déductions
5. Vérifier le salaire net calculé
6. Enregistrer
```

#### 4. Évaluation des performances
```
1. Accéder à l'onglet "Évaluations"
2. Cliquer sur "Nouvelle évaluation"
3. Sélectionner l'employé et le type d'évaluation
4. Noter chaque critère avec le curseur
5. Ajouter commentaires et objectifs
6. Enregistrer
```

## 🔒 Sécurité

### Règles Firestore
Les règles de sécurité ont été mises en place :

- **Congés** : Tous les employés authentifiés peuvent créer des demandes, seul le DG peut approuver/refuser
- **Présences** : Tous peuvent pointer, seul le DG peut modifier/supprimer
- **Salaires** : Accès et modifications réservés au DG uniquement
- **Évaluations** : Lecture pour tous, écriture réservée au DG

### Accès
- Module réservé aux utilisateurs avec le rôle **"dg"** (Directeur Général)
- Les autres rôles n'ont pas accès à la page RH

## 📊 Structure des Données

### Collections Firestore

#### `conges`
```javascript
{
  employeId: string,
  type: string,
  dateDebut: timestamp,
  dateFin: timestamp,
  duree: number,
  statut: 'en_attente' | 'approuve' | 'refuse',
  motif: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `presences`
```javascript
{
  employeId: string,
  date: timestamp,
  statut: 'present' | 'absent' | 'retard' | 'absent_justifie',
  heureArrivee: string,
  heureDepart: string,
  commentaire: string,
  createdAt: timestamp
}
```

#### `salaires`
```javascript
{
  employeId: string,
  mois: string,
  salaireBase: number,
  primes: number,
  deductions: number,
  salaireNet: number,
  statut: 'paye',
  datePaiement: timestamp,
  methodePaiement: string,
  createdAt: timestamp
}
```

#### `evaluations`
```javascript
{
  employeId: string,
  type: string,
  date: timestamp,
  note: number,
  notesDetaillees: {
    performance: number,
    ponctualite: number,
    travailEquipe: number,
    initiative: number,
    competencesTechniques: number
  },
  commentaire: string,
  objectifs: string,
  evaluateurId: string,
  createdAt: timestamp
}
```

## 🎨 Fonctionnalités Avancées

### 1. Pointage Rapide
- Pointer tous les employés actifs en un clic
- Horaires par défaut : 08:00 - 17:00
- Statut par défaut : Présent

### 2. Filtres Intelligents
- Congés : Par statut
- Salaires : Par mois
- Présences : Par date

### 3. Statistiques en Temps Réel
- Calculs automatiques
- Graphiques visuels
- Indicateurs colorés

### 4. Interface Intuitive
- Cards modernes et responsive
- Modals pour les formulaires
- Feedback visuel (toast notifications)
- Design professionnel

## 🛠️ Fichiers Créés

### Composants Principaux
- `/src/pages/RessourcesHumaines.js` - Page principale
- `/src/components/rh/CongesManager.js` - Module congés
- `/src/components/rh/PresencesManager.js` - Module présences
- `/src/components/rh/SalairesManager.js` - Module salaires
- `/src/components/rh/EvaluationsManager.js` - Module évaluations

### Scripts Utilitaires
- `init-donnees-rh.html` - Initialisation des données de test
- `creer-premier-dg.html` - Création du premier utilisateur DG
- `donner-acces-complet.html` - Gestion des accès utilisateurs

### Configuration
- `firestore.rules` - Règles de sécurité mises à jour
- Route ajoutée : `/ressources-humaines`
- Menu mis à jour avec l'icône Briefcase

## 📝 Prochaines Améliorations Possibles

- Export Excel/PDF des rapports
- Notifications automatiques (congés à venir, anniversaires, etc.)
- Gestion des contrats et documents
- Module de recrutement
- Gestion des formations
- Organigramme dynamique
- Dashboard RH avancé avec analytics
- Gestion des notes de frais

## 💡 Conseils

1. **Données de test** : Utilisez `init-donnees-rh.html` avant de tester
2. **Employés** : Créez d'abord des employés via la page "Employés"
3. **Sauvegardes** : Les règles Firestore sont déployées, pensez à faire des backups
4. **Performance** : Pour de grandes quantités de données, considérez la pagination
5. **Mobile** : L'interface est responsive et fonctionne sur mobile

## 🎯 Résumé

Votre module RH est maintenant **complet et opérationnel** avec :
- ✅ 5 modules principaux fonctionnels
- ✅ Interface moderne et intuitive
- ✅ Sécurité configurée
- ✅ Règles Firestore déployées
- ✅ Navigation intégrée
- ✅ Scripts d'initialisation

**Le système est prêt pour la production !** 🚀

