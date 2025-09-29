// Script à exécuter dans la console du navigateur pour créer des données de test
// Copiez et collez ce code dans la console de votre navigateur (F12)

console.log('🚀 Création de données de test...');

// Configuration Firebase (utilisez la même que dans votre app)
const firebaseConfig = {
    apiKey: "AIzaSyDE-TBWNZ_Y4WdPHaezRXIf1vizPEralVY",
    authDomain: "stock-bcbd3.firebaseapp.com",
    projectId: "stock-bcbd3",
    storageBucket: "stock-bcbd3.appspot.com",
    messagingSenderId: "901950451449",
    appId: "1:901950451449:web:your-app-id"
};

// Initialiser Firebase si pas déjà fait
if (typeof firebase === 'undefined') {
    console.log('❌ Firebase n\'est pas chargé. Veuillez exécuter ce script sur la page de votre application.');
} else {
    const db = firebase.firestore();
    
    // Fonction pour créer des commandes d'exemple
    async function createSampleCommandes() {
        try {
            console.log('📝 Création des commandes...');
            
            const commandes = [
                {
                    article: "Ordinateur portable Dell",
                    description: "Laptop pour le service informatique",
                    service: "Informatique",
                    quantite: 2,
                    statut: "en_attente",
                    createdAt: new Date(),
                    createdBy: "service-user-1"
                },
                {
                    article: "Imprimante HP LaserJet",
                    description: "Imprimante laser pour le bureau",
                    service: "Administration",
                    quantite: 1,
                    prix: 450.00,
                    statut: "en_attente_approbation",
                    createdAt: new Date(),
                    createdBy: "service-user-2",
                    dateAjoutPrix: new Date(),
                    prixAjoutePar: "achat-user-1"
                },
                {
                    article: "Formation sécurité informatique",
                    description: "Formation pour l'équipe IT",
                    service: "Formation",
                    quantite: 1,
                    prix: 1500.00,
                    statut: "approuve",
                    createdAt: new Date(),
                    createdBy: "service-user-2",
                    dateAjoutPrix: new Date(),
                    prixAjoutePar: "achat-user-1",
                    dateApprobation: new Date(),
                    approuvePar: "dg-user-1",
                    signatureDG: "Jean Dupont - DG",
                    commentaireDG: "Formation essentielle pour la sécurité"
                },
                {
                    article: "Équipement de luxe",
                    description: "Équipement non essentiel",
                    service: "Administration",
                    quantite: 1,
                    prix: 5000.00,
                    statut: "rejete",
                    createdAt: new Date(),
                    createdBy: "service-user-3",
                    dateAjoutPrix: new Date(),
                    prixAjoutePar: "achat-user-1",
                    dateRejet: new Date(),
                    rejetePar: "dg-user-1",
                    commentaireRejet: "Budget insuffisant pour cet achat"
                }
            ];

            for (const commande of commandes) {
                await db.collection('commandes').add(commande);
                console.log(`✅ Commande créée: ${commande.article} (${commande.statut})`);
            }

            console.log('🎉 Toutes les commandes ont été créées !');
            console.log('🔄 Rechargez la page pour voir les données.');
            
        } catch (error) {
            console.error('❌ Erreur:', error);
        }
    }
    
    // Fonction pour créer des véhicules
    async function createSampleVehicules() {
        try {
            console.log('🚗 Création des véhicules...');
            
            const vehicules = [
                {
                    marque: "Toyota",
                    modele: "Corolla",
                    immatriculation: "AB-123-CD",
                    annee: "2020",
                    kilometrage: "45000",
                    type: "voiture",
                    statut: "actif",
                    createdAt: new Date()
                },
                {
                    marque: "Ford",
                    modele: "Transit",
                    immatriculation: "EF-456-GH",
                    annee: "2019",
                    kilometrage: "78000",
                    type: "camion",
                    statut: "actif",
                    createdAt: new Date()
                }
            ];

            for (const vehicule of vehicules) {
                await db.collection('vehicules').add(vehicule);
                console.log(`✅ Véhicule créé: ${vehicule.marque} ${vehicule.modele}`);
            }

            console.log('🎉 Tous les véhicules ont été créés !');
            
        } catch (error) {
            console.error('❌ Erreur:', error);
        }
    }
    
    // Fonction pour créer des prestataires
    async function createSamplePrestataires() {
        try {
            console.log('🔧 Création des prestataires...');
            
            const prestataires = [
                {
                    nom: "Garage Auto Plus",
                    adresse: "123 Rue de la République, Paris",
                    telephone: "01 23 45 67 89",
                    email: "contact@garageautoplus.fr",
                    specialite: "Entretien général",
                    statut: "actif",
                    createdAt: new Date()
                },
                {
                    nom: "Mécanique Express",
                    adresse: "456 Avenue des Champs, Lyon",
                    telephone: "04 56 78 90 12",
                    email: "info@mecanique-express.fr",
                    specialite: "Réparation rapide",
                    statut: "actif",
                    createdAt: new Date()
                }
            ];

            for (const prestataire of prestataires) {
                await db.collection('prestataires').add(prestataire);
                console.log(`✅ Prestataire créé: ${prestataire.nom}`);
            }

            console.log('🎉 Tous les prestataires ont été créés !');
            
        } catch (error) {
            console.error('❌ Erreur:', error);
        }
    }
    
    // Fonction pour créer des articles de stock
    async function createSampleStock() {
        try {
            console.log('📦 Création des articles de stock...');
            
            const articles = [
                {
                    nom: "Ordinateur portable Dell",
                    reference: "DELL-LAT-001",
                    description: "Laptop Dell Latitude pour le bureau",
                    categorie: "Informatique",
                    quantite: 15,
                    seuilMinimum: 5,
                    prixUnitaire: 1200.00,
                    fournisseur: "Dell France",
                    emplacement: "Entrepôt A - Étage 1",
                    createdAt: new Date()
                },
                {
                    nom: "Cartouches d'encre HP",
                    reference: "CAR-HP-006",
                    description: "Cartouches d'encre HP 305 - Noir",
                    categorie: "Informatique",
                    quantite: 2, // Stock faible
                    seuilMinimum: 5,
                    prixUnitaire: 35.00,
                    fournisseur: "HP France",
                    emplacement: "Entrepôt A - Étage 2",
                    createdAt: new Date()
                },
                {
                    nom: "Claviers USB",
                    reference: "CLAV-USB-007",
                    description: "Claviers USB standard",
                    categorie: "Informatique",
                    quantite: 0, // Rupture de stock
                    seuilMinimum: 10,
                    prixUnitaire: 25.00,
                    fournisseur: "Logitech France",
                    emplacement: "Entrepôt A - Étage 1",
                    createdAt: new Date()
                }
            ];

            for (const article of articles) {
                await db.collection('stock').add(article);
                console.log(`✅ Article créé: ${article.nom} (Stock: ${article.quantite})`);
            }

            console.log('🎉 Tous les articles de stock ont été créés !');
            
        } catch (error) {
            console.error('❌ Erreur:', error);
        }
    }
    
    // Fonction principale
    async function createAllSampleData() {
        console.log('🚀 Début de la création de toutes les données...');
        
        await createSampleCommandes();
        await createSampleVehicules();
        await createSamplePrestataires();
        await createSampleStock();
        
        console.log('🎉 Toutes les données de test ont été créées !');
        console.log('🔄 Rechargez votre application pour voir les données.');
    }
    
    // Exécuter la création
    createAllSampleData();
}
