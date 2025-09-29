// Script à exécuter dans la console du navigateur sur https://stock-bcbd3.web.app
// Copier-coller ce code dans la console (F12) et appuyer sur Entrée

async function addEmployes() {
    try {
        console.log('Ajout d\'employés de test...');
        
        // Import Firebase (si pas déjà fait)
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getFirestore, collection, addDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        const firebaseConfig = {
            apiKey: "AIzaSyDE-TBWNZ_Y4WdPHaezRXIf1vizPEralVY",
            authDomain: "stock-bcbd3.firebaseapp.com",
            projectId: "stock-bcbd3",
            storageBucket: "stock-bcbd3.appspot.com",
            messagingSenderId: "901950451449",
            appId: "1:901950451449:web:stock-bcbd3"
        };
        
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        
        // Employés de test
        const employes = [
            {
                nom: 'Diallo',
                prenom: 'Amadou',
                email: 'amadou.diallo@test.com',
                telephone: '+224 123 456 789',
                service: 'Informatique',
                poste: 'Développeur',
                dateEmbauche: new Date('2023-01-15'),
                statut: 'actif',
                createdAt: new Date(),
                createdBy: 'system',
                createdByName: 'Système'
            },
            {
                nom: 'Traoré',
                prenom: 'Fatoumata',
                email: 'fatoumata.traore@test.com',
                telephone: '+224 987 654 321',
                service: 'Ressources Humaines',
                poste: 'Responsable RH',
                dateEmbauche: new Date('2022-06-01'),
                statut: 'actif',
                createdAt: new Date(),
                createdBy: 'system',
                createdByName: 'Système'
            },
            {
                nom: 'Bah',
                prenom: 'Ibrahima',
                email: 'ibrahima.bah@test.com',
                telephone: '+224 555 123 456',
                service: 'Comptabilité',
                poste: 'Comptable',
                dateEmbauche: new Date('2023-03-10'),
                statut: 'actif',
                createdAt: new Date(),
                createdBy: 'system',
                createdByName: 'Système'
            },
            {
                nom: 'Camara',
                prenom: 'Mariama',
                email: 'mariama.camara@test.com',
                telephone: '+224 777 888 999',
                service: 'Achat',
                poste: 'Acheteur',
                dateEmbauche: new Date('2022-09-15'),
                statut: 'actif',
                createdAt: new Date(),
                createdBy: 'system',
                createdByName: 'Système'
            },
            {
                nom: 'Sow',
                prenom: 'Ousmane',
                email: 'ousmane.sow@test.com',
                telephone: '+224 333 444 555',
                service: 'Maintenance',
                poste: 'Technicien',
                dateEmbauche: new Date('2023-05-20'),
                statut: 'actif',
                createdAt: new Date(),
                createdBy: 'system',
                createdByName: 'Système'
            }
        ];
        
        // Ajouter chaque employé
        for (const employe of employes) {
            try {
                const docRef = await addDoc(collection(db, 'employes'), employe);
                console.log('✅ Employé créé:', employe.nom, employe.prenom, 'ID:', docRef.id);
            } catch (error) {
                console.error('❌ Erreur pour', employe.nom, ':', error);
            }
        }
        
        console.log('🎉 Employés ajoutés avec succès !');
        console.log('Vous pouvez maintenant tester la sortie de stock.');
        
    } catch (error) {
        console.error('❌ Erreur générale:', error);
    }
}

// Exécuter la fonction
addEmployes();
