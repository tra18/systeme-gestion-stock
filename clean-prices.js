// Script pour nettoyer les prix dans Firestore
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, updateDoc, doc } = require('firebase/firestore');

// Configuration Firebase (utilisez vos vraies clés)
const firebaseConfig = {
  apiKey: "AIzaSyBqQqQqQqQqQqQqQqQqQqQqQqQqQqQqQ",
  authDomain: "stock-bcbd3.firebaseapp.com",
  projectId: "stock-bcbd3",
  storageBucket: "stock-bcbd3.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fonction pour nettoyer un prix
function cleanPrice(price) {
  if (!price) return null;
  
  let cleanPrice = String(price).trim();
  
  // Remplacer les barres obliques par rien
  if (cleanPrice.includes('/')) {
    cleanPrice = cleanPrice.replace(/\//g, '');
  }
  
  // Enlever tous les caractères non numériques sauf points et virgules
  cleanPrice = cleanPrice.replace(/[^\d.,]/g, '');
  
  // Remplacer les virgules par des points
  cleanPrice = cleanPrice.replace(',', '.');
  
  // Convertir en nombre
  const numPrice = parseFloat(cleanPrice);
  
  return isNaN(numPrice) ? null : numPrice;
}

async function cleanCommandesPrices() {
  try {
    console.log('🧹 Nettoyage des prix des commandes...');
    
    const commandesSnapshot = await getDocs(collection(db, 'commandes'));
    let cleaned = 0;
    
    for (const docSnapshot of commandesSnapshot.docs) {
      const data = docSnapshot.data();
      const originalPrix = data.prix;
      const cleanedPrix = cleanPrice(originalPrix);
      
      if (originalPrix !== cleanedPrix && cleanedPrix !== null) {
        console.log(`📝 Commande ${docSnapshot.id}: "${originalPrix}" → ${cleanedPrix}`);
        
        await updateDoc(doc(db, 'commandes', docSnapshot.id), {
          prix: cleanedPrix
        });
        
        cleaned++;
      }
    }
    
    console.log(`✅ ${cleaned} commandes nettoyées`);
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

async function cleanMaintenancePrices() {
  try {
    console.log('🧹 Nettoyage des coûts de maintenance...');
    
    const maintenanceSnapshot = await getDocs(collection(db, 'maintenance'));
    let cleaned = 0;
    
    for (const docSnapshot of maintenanceSnapshot.docs) {
      const data = docSnapshot.data();
      const originalCout = data.coutEstime;
      const cleanedCout = cleanPrice(originalCout);
      
      if (originalCout !== cleanedCout && cleanedCout !== null) {
        console.log(`📝 Maintenance ${docSnapshot.id}: "${originalCout}" → ${cleanedCout}`);
        
        await updateDoc(doc(db, 'maintenance', docSnapshot.id), {
          coutEstime: cleanedCout
        });
        
        cleaned++;
      }
    }
    
    console.log(`✅ ${cleaned} maintenances nettoyées`);
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

async function cleanEmployesSalaires() {
  try {
    console.log('🧹 Nettoyage des salaires des employés...');
    
    const employesSnapshot = await getDocs(collection(db, 'employes'));
    let cleaned = 0;
    
    for (const docSnapshot of employesSnapshot.docs) {
      const data = docSnapshot.data();
      const originalSalaire = data.salaire;
      const cleanedSalaire = cleanPrice(originalSalaire);
      
      if (originalSalaire !== cleanedSalaire && cleanedSalaire !== null) {
        console.log(`📝 Employé ${docSnapshot.id}: "${originalSalaire}" → ${cleanedSalaire}`);
        
        await updateDoc(doc(db, 'employes', docSnapshot.id), {
          salaire: cleanedSalaire
        });
        
        cleaned++;
      }
    }
    
    console.log(`✅ ${cleaned} employés nettoyés`);
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

async function main() {
  console.log('🚀 Début du nettoyage des prix...');
  
  await cleanCommandesPrices();
  await cleanMaintenancePrices();
  await cleanEmployesSalaires();
  
  console.log('🎉 Nettoyage terminé !');
  process.exit(0);
}

main().catch(console.error);
