# 🔑 Guide des Codes PIN - Pointage Mobile

## 📋 Vue d'ensemble

Le système de pointage par QR Code universel nécessite que **chaque employé ait un code PIN personnel unique** (4 à 6 chiffres).

## 🚀 Génération automatique

### Utiliser le script `generer-codes-pin.html`

1. **Ouvrez** le fichier `generer-codes-pin.html` dans votre navigateur
2. **Choisissez** une option :
   - ✨ **Nouveaux employés uniquement** : Génère des codes PIN seulement pour ceux qui n'en ont pas
   - 🔄 **Régénérer tous les codes** : Crée de nouveaux codes PIN pour TOUS les employés (remplace les anciens)
3. **Définissez** la longueur du code PIN (4 à 6 chiffres, recommandé : 4)
4. **Cliquez** sur "Générer les codes PIN"
5. **Attendez** que la génération se termine
6. **Exportez** les résultats :
   - 📥 **CSV** : Pour Excel/Google Sheets
   - 📋 **Copier** : Pour coller dans un document
   - 🖨️ **Imprimer** : Pour distribuer physiquement

### Résultat

Le script va :
- ✅ Générer des codes PIN aléatoires et **uniques**
- ✅ Les enregistrer automatiquement dans Firestore (champ `codePIN`)
- ✅ Afficher la liste complète avec : Nom, Prénom, Poste, Code PIN
- ✅ Permettre l'export pour communication

## 🔧 Génération manuelle (si nécessaire)

### Via Firestore Console

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet : **stock-bcbd3**
3. Menu **Firestore Database**
4. Collection **employes**
5. Pour chaque employé :
   - Cliquez sur le document
   - Ajoutez un champ : `codePIN` (type: string)
   - Valeur : "1234" (ou autre code unique)
   - Sauvegardez

### Via script console Firebase

```javascript
// Dans la console Firestore
const employes = await db.collection('employes').get();
employes.forEach(async (doc) => {
  const pin = Math.floor(1000 + Math.random() * 9000).toString();
  await db.collection('employes').doc(doc.id).update({
    codePIN: pin
  });
  console.log(`${doc.data().nom}: ${pin}`);
});
```

## 📬 Communication aux employés

### Option 1 : Email individuel (recommandé)

**Template** :

```
Objet : Votre code PIN personnel - Nouveau système de pointage

Bonjour [Prénom],

Dans le cadre du déploiement de notre nouveau système de pointage mobile, 
voici votre code PIN personnel :

🔑 CODE PIN : [XXXX]

⚠️ IMPORTANT :
- Ce code est strictement personnel
- Ne le partagez avec personne
- Vous en aurez besoin UNIQUEMENT lors de votre premier pointage
- Les jours suivants, le pointage sera automatique

📱 Comment utiliser :
1. Scannez le QR code affiché à l'entrée
2. Entrez votre code PIN ci-dessus
3. Votre téléphone sera enregistré
4. C'est tout !

Si vous avez des questions, contactez les RH.

Cordialement,
Service RH
```

### Option 2 : Distribution physique

1. **Imprimez** la liste depuis le générateur
2. **Découpez** ou créez des cartes individuelles
3. **Remettez** en main propre avec signature
4. **Conservez** une copie sécurisée

**Format carte** :
```
┌────────────────────────────────┐
│  CODE PIN PERSONNEL            │
│                                │
│  [Nom Prénom]                  │
│  [Poste]                       │
│                                │
│  Votre code PIN : [XXXX]       │
│                                │
│  🔒 Ne pas partager            │
│  📱 1er scan uniquement        │
└────────────────────────────────┘
```

### Option 3 : SMS (si disponible)

```
[Entreprise] Votre code PIN pointage: [XXXX]
À utiliser lors du 1er scan du QR code.
Ne pas partager. Info: [Tel RH]
```

## 🔒 Sécurité des codes PIN

### Bonnes pratiques

✅ **À FAIRE** :
- Générer des codes aléatoires
- Communiquer de façon sécurisée (email pro, remise physique)
- Conserver une copie sécurisée (fichier chiffré, coffre)
- Changer le PIN en cas de suspicion de compromission

❌ **À NE PAS FAIRE** :
- Utiliser des codes prévisibles (1234, 0000, 1111)
- Afficher publiquement (tableau, liste non sécurisée)
- Partager par messagerie non sécurisée
- Réutiliser les mêmes codes pour plusieurs employés

### Stockage sécurisé

Les codes PIN sont stockés :
- ✅ Dans Firestore (sécurisé par Firebase)
- ✅ Dans le CSV exporté (à protéger !)
- ❌ **PAS** en clair dans les emails non chiffrés

**Recommandation** : Chiffrez le fichier CSV exporté ou utilisez un gestionnaire de mots de passe.

## 🔄 Gestion des codes PIN

### Réinitialiser un code PIN

**Option 1 : Via Firestore**
1. Firestore → employes → [employé]
2. Modifiez le champ `codePIN`
3. Communiquez le nouveau code à l'employé

**Option 2 : Via le générateur**
1. Ouvrez `generer-codes-pin.html`
2. Sélectionnez "Régénérer tous les codes"
3. Générez
4. Communiquez les nouveaux codes

### Employé a oublié son code PIN

1. **Vérifiez** son identité
2. **Consultez** Firestore ou votre liste sauvegardée
3. **Communiquez** le code de façon sécurisée
4. **Ou régénérez** un nouveau code

### Employé change de téléphone

✅ **Pas besoin de nouveau code PIN !**

L'employé :
1. Scanne le QR code avec le nouveau téléphone
2. Entre son code PIN existant
3. Le système désactive l'ancien appareil
4. Enregistre le nouveau

## 📊 Statistiques et vérification

### Vérifier quels employés ont un code PIN

```javascript
// Dans la console Firebase
const employesSnapshot = await getDocs(collection(db, 'employes'));
const employesWithPIN = [];
const employesWithoutPIN = [];

employesSnapshot.forEach(doc => {
  const data = doc.data();
  if (data.statut === 'actif') {
    if (data.codePIN) {
      employesWithPIN.push(data.nom);
    } else {
      employesWithoutPIN.push(data.nom);
    }
  }
});

console.log('Avec PIN:', employesWithPIN.length, employesWithPIN);
console.log('Sans PIN:', employesWithoutPIN.length, employesWithoutPIN);
```

### Vérifier l'unicité des codes PIN

```javascript
// Vérifier les doublons
const pins = new Map();
employesSnapshot.forEach(doc => {
  const pin = doc.data().codePIN;
  if (pin) {
    if (pins.has(pin)) {
      console.warn(`DOUBLON détecté: ${pin} utilisé par ${pins.get(pin)} et ${doc.data().nom}`);
    } else {
      pins.set(pin, doc.data().nom);
    }
  }
});
```

## 🆘 Dépannage

### Erreur : "Code PIN invalide"

**Causes possibles** :
- Le code PIN n'existe pas dans Firestore
- L'employé est inactif (`statut !== 'actif'`)
- Faute de frappe

**Solution** :
1. Vérifiez dans Firestore que le champ `codePIN` existe
2. Vérifiez que `statut: 'actif'`
3. Demandez à l'employé de re-saisir attentivement

### Erreur : "Appareil déjà enregistré pour un autre employé"

**Cause** : Bug ou tentative de fraude

**Solution** :
1. Identifiez l'appareil concerné (fingerprint) dans la collection `devices`
2. Vérifiez à quel employé il est associé
3. Si légitime (changement d'employé), désactivez l'ancien device
4. Si fraude, enquêtez

### Le générateur ne fonctionne pas

**Vérifications** :
- ✅ Connexion internet active
- ✅ Configuration Firebase correcte dans le fichier HTML
- ✅ Permissions Firestore permettent l'écriture
- ✅ Console du navigateur (F12) pour voir les erreurs

## 📋 Checklist de déploiement

Avant de déployer le système :

- [ ] Tous les employés actifs ont un code PIN
- [ ] Les codes PIN sont uniques
- [ ] Les codes PIN sont communiqués aux employés
- [ ] Une copie sécurisée des codes est conservée
- [ ] Les employés savent comment utiliser leur code
- [ ] Un processus de réinitialisation est en place
- [ ] Le QR Code universel est affiché
- [ ] Les tests ont été effectués

## 💡 Conseils

### Longueur du code PIN

- **4 chiffres** : ✅ Recommandé - Facile à retenir, rapide à saisir
- **5 chiffres** : ⚖️ Bon compromis - Plus sécurisé
- **6 chiffres** : 🔒 Maximum sécurité - Peut être moins pratique

### Renouvellement

**Recommandation** : Renouvelez les codes PIN :
- Tous les 6-12 mois (bonnes pratiques de sécurité)
- En cas de départ d'un employé ayant eu accès à la liste
- Si suspicion de compromission

### Backup

**Important** : Conservez toujours une copie sécurisée des codes PIN !

Options :
- Fichier CSV chiffré
- Gestionnaire de mots de passe (1Password, LastPass, etc.)
- Coffre physique
- Base de données sécurisée

## 🎓 Formation

Lors du déploiement, formez :

**Les employés** :
- Comment scanner le QR code
- Où entrer le code PIN
- Que faire en cas d'oubli
- Importance de ne pas partager

**Les RH** :
- Comment générer/régénérer des codes
- Comment consulter les codes existants
- Processus de réinitialisation
- Gestion des cas particuliers

## 🔗 Ressources

- **Générateur** : `generer-codes-pin.html`
- **Documentation complète** : `POINTAGE_QR_UNIVERSEL.md`
- **Guide de migration** : `MIGRATION_VERS_QR_UNIVERSEL.md`
- **Firebase Console** : https://console.firebase.google.com/

---

**Questions ?** Consultez la documentation ou contactez le support technique.

