import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Fonction pour mettre à jour le rôle d'un utilisateur
export const updateUserRole = async (userId, newRole) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: new Date()
    });
    console.log(`Rôle utilisateur mis à jour vers: ${newRole}`);
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du rôle:', error);
    return false;
  }
};

// Fonction pour obtenir le profil utilisateur
export const getUserProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { id: userId, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    return null;
  }
};

// Rôles disponibles
export const AVAILABLE_ROLES = {
  'dg': 'Directeur Général (Accès complet)',
  'achat': 'Service Achat (Commandes + Fournisseurs)',
  'service': 'Service (Commandes + Maintenance)'
};
