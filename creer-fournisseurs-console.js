// Script pour créer des fournisseurs de test
// À exécuter dans la console du navigateur

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDE-TBWNZ_Y4WdPHaezRXIf1vizPEralVY",
  authDomain: "stock-bcbd3.firebaseapp.com",
  projectId: "stock-bcbd3",
  storageBucket: "stock-bcbd3.appspot.com",
  messagingSenderId: "901950451449",
  appId: "1:901950451449:web:your-app-id"
};

// Importer Firebase (si pas déjà fait)
if (typeof firebase === 'undefined') {
  console.log('❌ Firebase n\'est pas chargé. Veuillez d\'abord ouvrir l\'application.');
  console.log('💡 Ouvrez http://localhost:3000 dans votre navigateur');
} else {
  console.log('✅ Firebase est disponible');
  
  // Créer des fournisseurs de test
  const fournisseurs = [
    { 
      nom: "Fournisseur Alpha", 
      contact: "alpha@example.com", 
      telephone: "+224 123 456 789",
      adresse: "Conakry, Guinée",
      specialite: "Matériel de bureau"
    },
    { 
      nom: "Fournisseur Beta", 
      contact: "beta@example.com", 
      telephone: "+224 987 654 321",
      adresse: "Conakry, Guinée",
      specialite: "Équipements informatiques"
    },
    { 
      nom: "Fournisseur Gamma", 
      contact: "gamma@example.com", 
      telephone: "+224 555 666 777",
      adresse: "Conakry, Guinée",
      specialite: "Fournitures générales"
    },
    { 
      nom: "Fournisseur Delta", 
      contact: "delta@example.com", 
      telephone: "+224 111 222 333",
      adresse: "Conakry, Guinée",
      specialite: "Matériel technique"
    },
    { 
      nom: "Fournisseur Epsilon", 
      contact: "epsilon@example.com", 
      telephone: "+224 444 555 666",
      adresse: "Conakry, Guinée",
      specialite: "Services divers"
    }
  ];

  // Fonction pour créer un fournisseur
  async function createFournisseur(fournisseur) {
    try {
      const db = firebase.firestore();
      await db.collection('fournisseurs').add({
        ...fournisseur,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        createdBy: 'system',
        createdByName: 'Système'
      });
      console.log(`✅ Fournisseur créé: ${fournisseur.nom}`);
      return true;
    } catch (error) {
      console.error(`❌ Erreur pour ${fournisseur.nom}:`, error);
      return false;
    }
  }

  // Créer tous les fournisseurs
  async function createAllFournisseurs() {
    console.log('🏭 Création des fournisseurs...');
    let successCount = 0;
    
    for (const fournisseur of fournisseurs) {
      const success = await createFournisseur(fournisseur);
      if (success) successCount++;
    }
    
    console.log(`🎉 ${successCount}/${fournisseurs.length} fournisseurs créés avec succès !`);
    console.log('💡 Vous pouvez maintenant tester la page "Achat"');
  }

  // Exécuter la création
  createAllFournisseurs();
}
