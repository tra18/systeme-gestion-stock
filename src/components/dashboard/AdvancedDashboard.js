import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie,
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

const AdvancedDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7'); // 7 derniers jours par défaut
  const [stats, setStats] = useState({});
  const [chartData, setChartData] = useState([]);
  const [presenceData, setPresenceData] = useState([]);
  const [commandesData, setCommandesData] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const days = parseInt(timeRange);
      const startDate = startOfDay(subDays(new Date(), days));
      const endDate = endOfDay(new Date());
      
      // Charger toutes les données en parallèle
      const [
        employesSnap,
        commandesSnap,
        presencesSnap,
        stockSnap,
        vehiculesSnap
      ] = await Promise.all([
        getDocs(collection(db, 'employes')),
        getDocs(query(collection(db, 'commandes'), where('createdAt', '>=', startDate), where('createdAt', '<=', endDate))),
        getDocs(query(collection(db, 'presences'), where('date', '>=', startDate), where('date', '<=', endDate))),
        getDocs(collection(db, 'stock')),
        getDocs(collection(db, 'vehicules'))
      ]);

      // Traiter les données
      const employes = employesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const commandes = commandesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const presences = presencesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const stock = stockSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const vehicules = vehiculesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculer les statistiques
      const newStats = {
        totalEmployes: employes.length,
        employesActifs: employes.filter(e => e.statut === 'actif').length,
        totalCommandes: commandes.length,
        commandesApprouvees: commandes.filter(c => c.statut === 'approuve').length,
        commandesEnAttente: commandes.filter(c => c.statut === 'en_attente').length,
        totalPresences: presences.length,
        presencesAujourdhui: presences.filter(p => {
          const presenceDate = p.date?.toDate?.() || p.date;
          return format(presenceDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
        }).length,
        stockFaible: stock.filter(s => s.quantite <= (s.seuilMin || 10)).length,
        vehiculesEnMaintenance: vehicules.filter(v => v.statut === 'en_maintenance').length
      };

      setStats(newStats);

      // Préparer les données pour les graphiques
      prepareChartData(commandes, presences);
      preparePresenceData(presences, employes);
      prepareCommandesData(commandes);
      
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = (commandes, presences) => {
    const days = parseInt(timeRange);
    const chartData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'yyyy-MM-dd');

      const dayCommandes = commandes.filter(c => {
        const commandeDate = c.createdAt?.toDate?.() || c.createdAt;
        return format(commandeDate, 'yyyy-MM-dd') === dateStr;
      });

      const dayPresences = presences.filter(p => {
        const presenceDate = p.date?.toDate?.() || p.date;
        return format(presenceDate, 'yyyy-MM-dd') === dateStr;
      });

      chartData.push({
        date: format(date, 'dd/MM'),
        commandes: dayCommandes.length,
        presences: dayPresences.length,
        approuvees: dayCommandes.filter(c => c.statut === 'approuve').length
      });
    }

    setChartData(chartData);
  };

  const preparePresenceData = (presences, employes) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayPresences = presences.filter(p => {
      const presenceDate = p.date?.toDate?.() || p.date;
      return format(presenceDate, 'yyyy-MM-dd') === today;
    });

    const presenceByStatus = {
      present: 0,
      absent: 0,
      retard: 0,
      absent_justifie: 0
    };

    todayPresences.forEach(presence => {
      if (presenceByStatus.hasOwnProperty(presence.statut)) {
        presenceByStatus[presence.statut]++;
      }
    });

    const data = [
      { name: 'Présents', value: presenceByStatus.present, color: '#10B981' },
      { name: 'Absents', value: presenceByStatus.absent, color: '#EF4444' },
      { name: 'Retards', value: presenceByStatus.retard, color: '#F59E0B' },
      { name: 'Justifiés', value: presenceByStatus.absent_justifie, color: '#3B82F6' }
    ];

    setPresenceData(data);
  };

  const prepareCommandesData = (commandes) => {
    const statusCounts = commandes.reduce((acc, commande) => {
      acc[commande.statut] = (acc[commande.statut] || 0) + 1;
      return acc;
    }, {});

    const data = Object.entries(statusCounts).map(([status, count]) => ({
      status: status.replace('_', ' ').toUpperCase(),
      count,
      color: getStatusColor(status)
    }));

    setCommandesData(data);
  };

  const getStatusColor = (status) => {
    const colors = {
      'en_attente': '#F59E0B',
      'en_attente_prix': '#3B82F6',
      'en_attente_approbation': '#8B5CF6',
      'approuve': '#10B981',
      'rejete': '#EF4444'
    };
    return colors[status] || '#6B7280';
  };

  const getKPIColor = (value, threshold = 0) => {
    if (value > threshold) return 'text-green-600';
    if (value < threshold) return 'text-red-600';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec sélecteur de période */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tableau de Bord Avancé</h2>
          <p className="text-gray-600">Vue d'ensemble des {timeRange} derniers jours</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="7">7 derniers jours</option>
          <option value="30">30 derniers jours</option>
          <option value="90">3 derniers mois</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Employés Actifs</p>
              <p className={`text-2xl font-bold ${getKPIColor(stats.employesActifs)}`}>
                {stats.employesActifs}
              </p>
              <p className="text-xs text-gray-500">sur {stats.totalEmployes} total</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Présences Aujourd'hui</p>
              <p className={`text-2xl font-bold ${getKPIColor(stats.presencesAujourdhui)}`}>
                {stats.presencesAujourdhui}
              </p>
              <p className="text-xs text-gray-500">pointages du jour</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Commandes Approuvées</p>
              <p className={`text-2xl font-bold ${getKPIColor(stats.commandesApprouvees)}`}>
                {stats.commandesApprouvees}
              </p>
              <p className="text-xs text-gray-500">sur {stats.totalCommandes} total</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <ShoppingCart className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Stock Faible</p>
              <p className={`text-2xl font-bold ${stats.stockFaible > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {stats.stockFaible}
              </p>
              <p className="text-xs text-gray-500">articles à réapprovisionner</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <AlertTriangle className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique des tendances */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="mr-2 text-blue-600" size={20} />
            Tendances des {timeRange} derniers jours
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="commandes" 
                stackId="1" 
                stroke="#8884d8" 
                fill="#8884d8" 
                name="Commandes"
              />
              <Area 
                type="monotone" 
                dataKey="presences" 
                stackId="2" 
                stroke="#82ca9d" 
                fill="#82ca9d" 
                name="Présences"
              />
            </AreaChart>
          </ResponsiveContainer>
      </div>

        {/* Graphique des présences aujourd'hui */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <PieChart className="mr-2 text-green-600" size={20} />
            Présences Aujourd'hui
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={presenceData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {presenceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Graphique des commandes par statut */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BarChart3 className="mr-2 text-purple-600" size={20} />
          Répartition des Commandes par Statut
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={commandesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AdvancedDashboard;