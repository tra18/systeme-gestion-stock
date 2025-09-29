# 🔧 Guide - Résoudre les Problèmes d'Actions

## 🎯 Problème : Les Actions Ne Fonctionnent Pas

Si vous voyez le tableau mais que les boutons d'action ne fonctionnent pas, voici les solutions :

## 🚀 Solutions

### 1. **Mettre à jour les prix en GNF**

1. **Ouvrez** `update-prices-gnf.html` dans votre navigateur
2. **Cliquez** sur "Convertir les prix en GNF" OU "Créer de nouvelles commandes en GNF"
3. **Rechargez** votre application

### 2. **Vérifier les Erreurs de Compilation**

Si l'application ne compile pas correctement :

1. **Ouvrez la console** (F12)
2. **Vérifiez** s'il y a des erreurs JavaScript
3. **Rechargez** la page après correction

### 3. **Tester les Actions**

Après avoir corrigé les erreurs, vous devriez pouvoir :

#### **Service** :
- ✅ Créer de nouvelles commandes
- ✅ Voir toutes les commandes

#### **Achat** :
- ✅ Ajouter des prix aux commandes "en_attente"
- ✅ Voir les commandes avec prix ajoutés

#### **DG** :
- ✅ Valider les commandes "en_attente_approbation"
- ✅ Approuver ou rejeter avec signature

## 🔍 Vérifications

### Vérifiez que vous êtes connecté :
- Votre nom et rôle apparaissent en haut à droite
- Vous n'êtes pas redirigé vers la page de connexion

### Vérifiez votre rôle :
- **Service** : Peut créer des commandes
- **Achat** : Peut ajouter des prix
- **DG** : Peut valider avec signature

### Vérifiez les données :
- Le tableau contient des commandes
- Les statuts sont colorés (bleu, jaune, vert, rouge)

## 🎨 Interface Attendue

Après correction, vous devriez voir :

### Page Commandes :
- ✅ **Workflow visuel** en haut (4 étapes colorées)
- ✅ **Actions disponibles** selon votre rôle
- ✅ **Tableau rempli** avec des commandes
- ✅ **Prix en GNF** (ex: 11,400,000 GNF)
- ✅ **Boutons d'action** fonctionnels

### Actions par Rôle :

| Rôle | Actions Visibles |
|------|------------------|
| **Service** | Créer commande, Voir détails |
| **Achat** | Ajouter prix, Voir détails |
| **DG** | Valider, Approuver/Rejeter, Voir détails |

## 🚨 Si ça ne marche toujours pas

1. **Vérifiez la console** (F12) pour les erreurs
2. **Rechargez** complètement la page (Ctrl+F5)
3. **Vérifiez** que Firebase est configuré
4. **Vérifiez** que vous avez les bonnes permissions

## 🎉 Résultat Final

Une fois tout corrigé, vous devriez avoir :
- ✅ Un workflow complet et visible
- ✅ Des actions fonctionnelles selon votre rôle
- ✅ Des prix en GNF
- ✅ Un système de validation avec signature

**Le workflow sera alors parfaitement opérationnel !** 🚀
