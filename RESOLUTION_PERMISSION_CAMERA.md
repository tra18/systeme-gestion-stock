# 🔒 Résolution des Problèmes de Permission Caméra

## 🚨 Erreur rencontrée

```
NotAllowedError: Permission denied by system
```

Cette erreur signifie que **le navigateur n'a pas la permission** d'accéder à votre caméra.

## 📱 Solutions selon votre navigateur

### 🌐 Google Chrome / Microsoft Edge / Brave

#### Méthode 1 : Via l'icône de la barre d'adresse

1. Cherchez l'icône 🎥 ou 🔒 **à gauche de la barre d'adresse**
2. Cliquez dessus
3. Trouvez **"Caméra"** dans la liste
4. Changez de **"Bloquer"** à **"Autoriser"**
5. **Rechargez la page** (F5 ou Cmd+R)

#### Méthode 2 : Via les paramètres du site

1. Cliquez sur les **trois points** en haut à droite
2. Allez dans **Paramètres** → **Confidentialité et sécurité**
3. Cliquez sur **Paramètres des sites**
4. Cliquez sur **Caméra**
5. Trouvez `localhost:3000` dans la liste des sites bloqués
6. Déplacez-le vers **"Autorisé à accéder à votre caméra"**
7. Rechargez la page

### 🦊 Mozilla Firefox

#### Méthode 1 : Via l'icône de la barre d'adresse

1. Cliquez sur l'icône **🔒** à gauche de la barre d'adresse
2. Cliquez sur **">"** à côté de "Permissions bloquées"
3. Cherchez **"Utiliser la caméra"**
4. Sélectionnez **"Autoriser"** dans le menu déroulant
5. Rechargez la page

#### Méthode 2 : Via les paramètres

1. Cliquez sur les **trois lignes** en haut à droite
2. Allez dans **Paramètres** → **Vie privée et sécurité**
3. Faites défiler jusqu'à **"Permissions"**
4. Cliquez sur **"Paramètres"** à côté de "Caméra"
5. Trouvez `http://localhost:3000`
6. Changez le statut en **"Autoriser"**
7. Enregistrez et rechargez la page

### 🧭 Safari (macOS)

#### Méthode 1 : Via les préférences Safari

1. Dans le menu Safari, cliquez sur **Safari** → **Préférences**
2. Allez dans l'onglet **"Sites Web"**
3. Dans la barre latérale, cliquez sur **"Caméra"**
4. Trouvez `localhost` dans la liste
5. Changez le menu déroulant en **"Autoriser"**
6. Fermez les préférences et rechargez la page

#### Méthode 2 : Autorisation au moment de la demande

1. Quand le navigateur demande l'accès
2. Cliquez sur **"Autoriser"** (et non "Refuser")
3. Si vous avez cliqué sur "Refuser" par erreur, suivez la Méthode 1

### 🪟 Microsoft Edge (Windows/Mac)

Même procédure que Chrome (voir ci-dessus)

## 🖥️ Vérifications au niveau du système

### macOS

1. **Préférences Système** → **Sécurité et confidentialité**
2. Onglet **"Confidentialité"**
3. Dans la liste de gauche, sélectionnez **"Caméra"**
4. Assurez-vous que votre **navigateur** (Chrome, Firefox, Safari, etc.) est **coché** ✅
5. Si ce n'est pas le cas, cliquez sur le **cadenas 🔒** en bas à gauche pour déverrouiller
6. Cochez votre navigateur
7. Relancez le navigateur

### Windows 10/11

1. **Paramètres** → **Confidentialité**
2. Cliquez sur **"Caméra"**
3. Activez **"Autoriser les applications à accéder à votre caméra"**
4. Faites défiler et activez votre navigateur
5. Relancez le navigateur

### Linux

Les permissions dépendent de votre distribution, mais généralement :

1. Assurez-vous que votre webcam est détectée : `ls /dev/video*`
2. Vérifiez que votre utilisateur a les droits : `groups $USER`
3. Si besoin, ajoutez-vous au groupe video : `sudo usermod -a -G video $USER`
4. Déconnectez-vous et reconnectez-vous

## 🔧 Solutions alternatives

### Si vous n'avez pas de caméra

Le système offre d'autres méthodes de pointage :

1. **Pointage rapide** : Pointe tous les employés actifs d'un coup
2. **Pointage manuel** : Saisie manuelle pour chaque employé
3. **Importation** : Import via fichier Excel (si disponible)

### Si la caméra ne fonctionne pas

1. **Vérifiez le matériel** :
   - La caméra est-elle branchée ?
   - La LED de la caméra s'allume-t-elle ?
   - Fonctionne-t-elle dans d'autres applications ?

2. **Testez la caméra** :
   - Ouvrez une autre application utilisant la caméra (Zoom, Teams, etc.)
   - Si ça ne fonctionne pas ailleurs, c'est un problème matériel

3. **Pilotes** :
   - Windows : Mettez à jour les pilotes via le Gestionnaire de périphériques
   - macOS : Généralement automatique
   - Linux : Vérifiez que les modules webcam sont chargés

## 🔄 Procédure complète de réinitialisation

Si rien ne fonctionne, essayez cette procédure :

### Chrome/Edge

1. Allez sur `chrome://settings/content/camera`
2. Supprimez `localhost:3000` de toutes les listes
3. Fermez complètement le navigateur
4. Rouvrez-le
5. Accédez à nouveau à l'application
6. Quand demandé, cliquez sur **"Autoriser"**

### Firefox

1. Allez sur `about:preferences#privacy`
2. Dans la section "Permissions", cliquez sur "Paramètres" de Caméra
3. Supprimez tous les sites listés
4. Fermez Firefox
5. Rouvrez-le
6. Accédez à l'application
7. Autorisez l'accès quand demandé

### Safari

1. Safari → Préférences → Sites Web → Caméra
2. Supprimez localhost de la liste
3. Fermez Safari
4. Rouvrez-le
5. Autorisez quand demandé

## 📞 Utilisation du scanner QR amélioré

Le scanner QR a été **amélioré** pour mieux gérer les erreurs :

### Nouvelles fonctionnalités

1. **Message d'aide contextuel** :
   - Détecte automatiquement votre navigateur
   - Affiche des instructions spécifiques
   - Bouton "Réessayer" pour redemander la permission

2. **Gestion des erreurs** :
   - `NotAllowedError` → Permission refusée (guide affiché)
   - `NotFoundError` → Aucune caméra détectée
   - Autres erreurs → Message détaillé

3. **Interface améliorée** :
   - Écran de chargement pendant la demande de permission
   - Instructions pas à pas en cas d'erreur
   - Bouton pour fermer ou réessayer

### Comment ça fonctionne maintenant

1. Vous cliquez sur **"Scanner QR"**
2. Le système **demande la permission** automatiquement
3. **Trois scénarios possibles** :
   - ✅ **Permission accordée** → Le scanner s'affiche
   - ❌ **Permission refusée** → Guide d'aide s'affiche
   - ⏳ **En attente** → Écran de chargement

4. Si permission refusée :
   - Instructions détaillées selon votre navigateur
   - Bouton **"Réessayer"** après avoir modifié les paramètres
   - Bouton **"Fermer"** pour annuler

## 🎯 Test rapide

Pour vérifier que tout fonctionne :

```bash
# Ouvrez votre navigateur et allez sur :
http://localhost:3000

# Testez l'accès à la caméra directement :
# 1. Ouvrez la console (F12)
# 2. Exécutez :
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    console.log('✅ Caméra accessible !');
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(err => console.error('❌ Erreur:', err.message));
```

Si vous voyez `✅ Caméra accessible !`, votre caméra fonctionne !

## ⚠️ Cas particuliers

### Localhost vs HTTPS

- `http://localhost` → ✅ Autorisé par défaut
- `http://127.0.0.1` → ✅ Autorisé par défaut
- `http://192.168.x.x` → ❌ Nécessite HTTPS
- `https://votresite.com` → ✅ Autorisé

**Important** : Pour un déploiement en production, utilisez **HTTPS** obligatoirement !

### Navigateur en mode incognito

Certains navigateurs bloquent la caméra en mode privé :
- Chrome : Autorise mais demande à chaque fois
- Firefox : Autorise mais demande à chaque fois
- Safari : Peut bloquer totalement

**Solution** : Utilisez le mode normal ou autorisez manuellement

### Plusieurs caméras

Si vous avez plusieurs caméras (webcam + caméra USB) :
1. Le scanner détecte toutes les caméras
2. Vous pouvez choisir dans le menu déroulant
3. Par défaut, sélectionne la caméra "arrière" ou la première

## 📱 Alternative mobile

Si vous utilisez un smartphone :

1. **Ouvrez le scanner QR** dans l'application
2. Le navigateur mobile demandera la permission
3. **Autorisez** l'accès à la caméra
4. Sélectionnez **caméra arrière** (meilleure qualité)
5. Scannez les badges

### iOS (Safari)

- Première fois : popup de demande de permission
- Autorisez et continuez
- La permission est mémorisée

### Android (Chrome)

- Même processus que sur desktop
- Plus facile à autoriser
- Caméra arrière par défaut

## 🎉 Après résolution

Une fois la permission accordée :

1. Le scanner démarre automatiquement
2. Vous verrez la vidéo de la caméra
3. Présentez un QR code devant la caméra
4. Le pointage se fait automatiquement !

## 📚 Documentation supplémentaire

- Guide complet : `GUIDE_POINTAGE_QR.md`
- Page de test : `test-pointage-qr.html`
- README technique : `POINTAGE_QR_README.md`

---

**Si le problème persiste après avoir essayé toutes ces solutions, contactez le support technique avec les informations suivantes :**

- Navigateur et version
- Système d'exploitation
- Type de caméra
- Message d'erreur exact
- Capture d'écran si possible

