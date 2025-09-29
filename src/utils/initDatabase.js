// Script d'initialisation de la base de données avec des données d'exemple
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  sampleVehicules, 
  sampleFournisseurs, 
  samplePrestataires, 
  sampleCommandes, 
  sampleMaintenance 
} from '../data/sampleData';

export const initializeDatabase = async () => {
  try {
    console.log('Initialisation de la base de données...');

    // Ajouter les véhicules
    const vehiculesRefs = [];
    for (const vehicule of sampleVehicules) {
      const docRef = await addDoc(collection(db, 'vehicules'), {
        ...vehicule,
        createdAt: new Date()
      });
      vehiculesRefs.push(docRef.id);
      console.log('Véhicule ajouté:', vehicule.marque, vehicule.modele);
    }

    // Ajouter les fournisseurs
    const fournisseursRefs = [];
    for (const fournisseur of sampleFournisseurs) {
      const docRef = await addDoc(collection(db, 'fournisseurs'), {
        ...fournisseur,
        createdAt: new Date()
      });
      fournisseursRefs.push(docRef.id);
      console.log('Fournisseur ajouté:', fournisseur.nom);
    }

    // Ajouter les prestataires
    const prestatairesRefs = [];
    for (const prestataire of samplePrestataires) {
      const docRef = await addDoc(collection(db, 'prestataires'), {
        ...prestataire,
        createdAt: new Date()
      });
      prestatairesRefs.push(docRef.id);
      console.log('Prestataire ajouté:', prestataire.nom);
    }

    // Ajouter les commandes
    for (const commande of sampleCommandes) {
      await addDoc(collection(db, 'commandes'), {
        ...commande,
        createdAt: new Date()
      });
      console.log('Commande ajoutée:', commande.article);
    }

    // Ajouter la maintenance (en utilisant les IDs des véhicules et prestataires)
    for (let i = 0; i < sampleMaintenance.length; i++) {
      const maintenance = sampleMaintenance[i];
      await addDoc(collection(db, 'maintenance'), {
        ...maintenance,
        vehiculeId: vehiculesRefs[i % vehiculesRefs.length],
        prestataireId: prestatairesRefs[i % prestatairesRefs.length],
        createdAt: new Date()
      });
      console.log('Maintenance ajoutée:', maintenance.type);
    }

    console.log('Base de données initialisée avec succès !');
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error);
    return false;
  }
};

// Fonction pour vérifier si la base de données est vide
export const isDatabaseEmpty = async () => {
  try {
    const { getDocs, collection } = await import('firebase/firestore');
    const [commandesSnapshot, maintenanceSnapshot, vehiculesSnapshot] = await Promise.all([
      getDocs(collection(db, 'commandes')),
      getDocs(collection(db, 'maintenance')),
      getDocs(collection(db, 'vehicules'))
    ]);

    return commandesSnapshot.empty && maintenanceSnapshot.empty && vehiculesSnapshot.empty;
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    return true;
  }
};
