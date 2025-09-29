// Données d'exemple pour tester l'application
export const sampleUsers = [
  {
    nom: 'Dupont',
    prenom: 'Jean',
    email: 'jean.dupont@entreprise.com',
    telephone: '01 23 45 67 89',
    service: 'RH',
    role: 'dg',
    actif: true
  },
  {
    nom: 'Martin',
    prenom: 'Marie',
    email: 'marie.martin@entreprise.com',
    telephone: '01 23 45 67 90',
    service: 'Achat',
    role: 'achat',
    actif: true
  },
  {
    nom: 'Bernard',
    prenom: 'Pierre',
    email: 'pierre.bernard@entreprise.com',
    telephone: '01 23 45 67 91',
    service: 'IT',
    role: 'service',
    actif: true
  }
];

export const sampleVehicules = [
  {
    marque: 'Renault',
    modele: 'Clio',
    immatriculation: 'AB-123-CD',
    annee: 2020,
    kilometrage: 45000,
    type: 'Voiture de service'
  },
  {
    marque: 'Peugeot',
    modele: 'Partner',
    immatriculation: 'EF-456-GH',
    annee: 2019,
    kilometrage: 78000,
    type: 'Utilitaire'
  },
  {
    marque: 'Citroën',
    modele: 'C3',
    immatriculation: 'IJ-789-KL',
    annee: 2021,
    kilometrage: 25000,
    type: 'Voiture de service'
  }
];

export const sampleFournisseurs = [
  {
    nom: 'Office Depot',
    specialite: 'Fournitures de bureau',
    telephone: '01 40 00 00 00',
    email: 'contact@officedepot.fr',
    adresse: '123 Avenue des Champs-Élysées',
    ville: 'Paris',
    codePostal: '75008',
    note: 4,
    commentaires: 'Fournisseur fiable, livraisons rapides'
  },
  {
    nom: 'LDLC',
    specialite: 'Matériel informatique',
    telephone: '04 72 00 00 00',
    email: 'contact@ldlc.com',
    adresse: '456 Rue de la République',
    ville: 'Lyon',
    codePostal: '69002',
    note: 5,
    commentaires: 'Excellent rapport qualité-prix'
  },
  {
    nom: 'Manutan',
    specialite: 'Équipements professionnels',
    telephone: '01 30 00 00 00',
    email: 'contact@manutan.fr',
    adresse: '789 Boulevard Saint-Germain',
    ville: 'Paris',
    codePostal: '75007',
    note: 3,
    commentaires: 'Bon service, prix corrects'
  }
];

export const samplePrestataires = [
  {
    nom: 'Garage Auto Plus',
    specialite: 'mecanique',
    telephone: '01 23 45 67 88',
    email: 'contact@garageautoplus.fr',
    adresse: '321 Rue de la Paix',
    ville: 'Paris',
    codePostal: '75001',
    delaiMoyen: 2,
    note: 4,
    commentaires: 'Service rapide et professionnel'
  },
  {
    nom: 'Carrosserie Moderne',
    specialite: 'carrosserie',
    telephone: '01 23 45 67 87',
    email: 'contact@carrosseriemoderne.fr',
    adresse: '654 Avenue de la République',
    ville: 'Paris',
    codePostal: '75011',
    delaiMoyen: 5,
    note: 3,
    commentaires: 'Bon travail mais délais parfois longs'
  },
  {
    nom: 'Contrôle Technique Express',
    specialite: 'controle_technique',
    telephone: '01 23 45 67 86',
    email: 'contact@ctexpress.fr',
    adresse: '987 Boulevard Voltaire',
    ville: 'Paris',
    codePostal: '75011',
    delaiMoyen: 1,
    note: 5,
    commentaires: 'Service express, très efficace'
  }
];

export const sampleCommandes = [
  {
    article: 'Ordinateur portable',
    description: 'Laptop pour nouveau collaborateur',
    quantite: 1,
    service: 'IT',
    statut: 'en_attente',
    urgence: 'normale'
  },
  {
    article: 'Papier A4',
    description: 'Rame de papier blanc 80g',
    quantite: 5,
    service: 'RH',
    statut: 'en_attente_approbation',
    prix: 25.50,
    urgence: 'normale'
  },
  {
    article: 'Stylos',
    description: 'Lot de 50 stylos bleus',
    quantite: 2,
    service: 'Comptabilité',
    statut: 'approuve',
    prix: 15.00,
    urgence: 'normale'
  }
];

export const sampleMaintenance = [
  {
    vehiculeId: 'vehicule1',
    type: 'revision',
    prestataireId: 'prestataire1',
    dateEntretien: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Dans 3 jours
    cout: 150.00,
    description: 'Révision annuelle',
    statut: 'planifie'
  },
  {
    vehiculeId: 'vehicule2',
    type: 'controle_technique',
    prestataireId: 'prestataire3',
    dateEntretien: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Dans 7 jours
    cout: 80.00,
    description: 'Contrôle technique obligatoire',
    statut: 'planifie'
  },
  {
    vehiculeId: 'vehicule3',
    type: 'reparation',
    prestataireId: 'prestataire1',
    dateEntretien: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Il y a 2 jours
    cout: 300.00,
    description: 'Réparation freins',
    statut: 'termine'
  }
];
