// Script pour changer le rôle d'un utilisateur
// Exécutez ce script dans la console de votre navigateur sur votre application

// Remplacez 'VOTRE_EMAIL' par votre email
const userEmail = 'VOTRE_EMAIL';

// Fonction pour changer le rôle
async function changeUserRole() {
  try {
    // Importez Firebase (si pas déjà fait)
    const { getFirestore, doc, updateDoc, collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    // Initialisez Firestore (remplacez par votre config)
    const db = getFirestore();
    
    // Trouvez l'utilisateur par email
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', userEmail));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ Utilisateur non trouvé');
      return;
    }
    
    // Mettez à jour le rôle
    const userDoc = querySnapshot.docs[0];
    await updateDoc(doc(db, 'users', userDoc.id), {
      role: 'dg',
      updatedAt: new Date()
    });
    
    console.log('✅ Rôle mis à jour vers "Directeur Général"');
    console.log('🔄 Rechargez la page pour voir les changements');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

// Exécutez la fonction
changeUserRole();
