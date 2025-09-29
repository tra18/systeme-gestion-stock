import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

// Script pour créer un utilisateur administrateur
export const createAdminUser = async (email, password, userData = {}) => {
  try {
    // Créer l'utilisateur avec Firebase Auth
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    // Créer le profil utilisateur dans Firestore avec le rôle DG
    await setDoc(doc(db, 'users', user.uid), {
      email: email,
      nom: userData.nom || 'Administrateur',
      prenom: userData.prenom || 'Admin',
      role: 'dg', // Directeur Général - accès complet
      service: userData.service || 'Direction',
      createdAt: new Date(),
      isAdmin: true
    });
    
    console.log('✅ Utilisateur administrateur créé avec succès !');
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Rôle: Directeur Général (accès complet)`);
    
    return user;
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur administrateur:', error);
    throw error;
  }
};

// Fonction pour créer un utilisateur avec un rôle spécifique
export const createUserWithRole = async (email, password, role, userData = {}) => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    await setDoc(doc(db, 'users', user.uid), {
      email: email,
      nom: userData.nom || 'Utilisateur',
      prenom: userData.prenom || 'Test',
      role: role,
      service: userData.service || 'Service',
      createdAt: new Date()
    });
    
    console.log(`✅ Utilisateur créé avec le rôle: ${role}`);
    return user;
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur:', error);
    throw error;
  }
};
