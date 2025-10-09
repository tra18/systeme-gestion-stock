import React, { useState, useEffect } from 'react';
import { FileText, Download, TrendingUp } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import RapportsManager from '../components/rapports/RapportsManager';
import toast from 'react-hot-toast';

const Rapports = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    commandes: [],
    maintenances: [],
    employes: [],
    stock: [],
    salaires: [],
    conges: []
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [
        commandesSnap,
        maintenancesSnap,
        employesSnap,
        stockSnap,
        salairesSnap,
        congesSnap
      ] = await Promise.all([
        getDocs(collection(db, 'commandes')),
        getDocs(collection(db, 'maintenance')),
        getDocs(collection(db, 'employes')),
        getDocs(collection(db, 'stock')),
        getDocs(collection(db, 'salaires')),
        getDocs(collection(db, 'conges'))
      ]);

      setData({
        commandes: commandesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        maintenances: maintenancesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        employes: employesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        stock: stockSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        salaires: salairesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        conges: congesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      });
    } catch (error) {
      console.error('Erreur chargement données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rapports et Exports</h1>
          <p className="text-gray-600 mt-1">Générez des rapports détaillés en PDF ou Excel</p>
        </div>
        <button
          onClick={loadAllData}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Download size={20} />
          <span>Actualiser les données</span>
        </button>
      </div>

      <RapportsManager
        commandes={data.commandes}
        maintenances={data.maintenances}
        employes={data.employes}
        stock={data.stock}
        salaires={data.salaires}
        conges={data.conges}
      />

      {/* Rapports prédéfinis rapides */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">⚡ Rapports Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 hover:shadow-md transition">
            <FileText className="text-blue-600" size={24} />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Commandes du mois</p>
              <p className="text-xs text-gray-600">PDF avec graphiques</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-200 hover:shadow-md transition">
            <TrendingUp className="text-green-600" size={24} />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Bilan RH</p>
              <p className="text-xs text-gray-600">Excel multi-feuilles</p>
            </div>
          </button>

          <button className="flex items-center space-x-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200 hover:shadow-md transition">
            <FileText className="text-purple-600" size={24} />
            <div className="text-left">
              <p className="font-semibold text-gray-900">Inventaire complet</p>
              <p className="text-xs text-gray-600">Excel avec valorisation</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Rapports;

