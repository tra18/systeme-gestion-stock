import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Calendar,
  Package,
  BarChart3
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const StockPredictionSimple = () => {
  const { userProfile } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);

  const generatePredictions = async () => {
    try {
      setLoading(true);
      
      // Charger les données historiques
      const [stockSnapshot, commandesSnapshot] = await Promise.all([
        getDocs(collection(db, 'stock')),
        getDocs(collection(db, 'commandes'))
      ]);

      const stock = stockSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const commandes = commandesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Analyser les tendances
      const analysis = analyzeStockTrends(stock, commandes);
      setAnalysisData(analysis);

      // Générer les prédictions
      const predictions = generateAIRecommendations(stock, commandes, analysis);
      setPredictions(predictions);

    } catch (error) {
      console.error('Erreur lors de la génération des prédictions:', error);
      toast.error('Erreur lors de l\'analyse des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userProfile?.uid) {
      generatePredictions();
    }
  }, [userProfile]);

  const analyzeStockTrends = (stock, commandes) => {
    // Analyser les tendances de consommation
    const consumptionRates = {};
    const serviceDemands = {};

    // Calculer les taux de consommation par article
    stock.forEach(item => {
      const itemCommandes = commandes.filter(cmd => 
        cmd.article === item.nom || cmd.articleId === item.id
      );
      
      if (itemCommandes.length > 0) {
        const totalQuantity = itemCommandes.reduce((sum, cmd) => sum + (cmd.quantite || 0), 0);
        const daysSinceFirst = itemCommandes.length > 0 ? 
          (new Date() - (itemCommandes[0].createdAt?.toDate?.() || new Date())) / (1000 * 60 * 60 * 24) : 1;
        
        consumptionRates[item.id] = {
          dailyRate: totalQuantity / Math.max(daysSinceFirst, 1),
          totalConsumption: totalQuantity,
          frequency: itemCommandes.length
        };
      }
    });

    // Analyser la demande par service
    commandes.forEach(cmd => {
      if (!serviceDemands[cmd.service]) serviceDemands[cmd.service] = {};
      if (!serviceDemands[cmd.service][cmd.article]) serviceDemands[cmd.service][cmd.article] = 0;
      serviceDemands[cmd.service][cmd.article] += cmd.quantite || 0;
    });

    return {
      consumptionRates,
      serviceDemands,
      totalItems: stock.length,
      totalCommandes: commandes.length
    };
  };

  const generateAIRecommendations = (stock, commandes, analysis) => {
    const recommendations = [];

    stock.forEach(item => {
      const consumption = analysis.consumptionRates[item.id];
      const currentStock = item.quantite || 0;
      const minThreshold = item.seuilMinimum || 0;

      if (consumption) {
        // Prédiction de rupture de stock
        const daysUntilEmpty = currentStock / consumption.dailyRate;
        const daysUntilLow = (currentStock - minThreshold) / consumption.dailyRate;

        // Recommandations basées sur l'IA
        if (daysUntilEmpty < 7) {
          recommendations.push({
            id: item.id,
            article: item.nom,
            type: 'urgent',
            priority: 'high',
            message: `Rupture de stock prévue dans ${Math.round(daysUntilEmpty)} jours`,
            recommendation: `Commander immédiatement ${Math.ceil(consumption.dailyRate * 30)} unités`,
            confidence: 0.95,
            impact: 'high'
          });
        } else if (daysUntilLow < 14) {
          recommendations.push({
            id: item.id,
            article: item.nom,
            type: 'warning',
            priority: 'medium',
            message: `Stock faible prévu dans ${Math.round(daysUntilLow)} jours`,
            recommendation: `Planifier une commande de ${Math.ceil(consumption.dailyRate * 21)} unités`,
            confidence: 0.85,
            impact: 'medium'
          });
        }

        // Recommandations d'optimisation
        if (consumption.dailyRate > 0) {
          const optimalStock = Math.ceil(consumption.dailyRate * 45); // 45 jours de stock
          const currentStock = item.quantite || 0;
          
          if (currentStock > optimalStock * 1.5) {
            recommendations.push({
              id: item.id,
              article: item.nom,
              type: 'optimization',
              priority: 'low',
              message: `Stock excédentaire détecté`,
              recommendation: `Réduire les commandes futures. Stock optimal: ${optimalStock} unités`,
              confidence: 0.75,
              impact: 'low'
            });
          }
        }
      }
    });

    // Recommandations globales
    const globalRecommendations = generateGlobalRecommendations(analysis);
    recommendations.push(...globalRecommendations);

    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const generateGlobalRecommendations = (analysis) => {
    const recommendations = [];

    // Recommandation sur la gestion des stocks
    const lowStockItems = Object.keys(analysis.consumptionRates).filter(id => {
      const rate = analysis.consumptionRates[id];
      return rate && rate.dailyRate > 0;
    });

    if (lowStockItems.length > analysis.totalItems * 0.3) {
      recommendations.push({
        id: 'global-1',
        article: 'Système global',
        type: 'system',
        priority: 'high',
        message: 'Plus de 30% des articles ont des taux de consommation élevés',
        recommendation: 'Réviser la stratégie d\'approvisionnement globale',
        confidence: 0.9,
        impact: 'high'
      });
    }

    return recommendations;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'urgent': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'warning': return <TrendingDown className="h-5 w-5 text-yellow-500" />;
      case 'optimization': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'system': return <BarChart3 className="h-5 w-5 text-purple-500" />;
      default: return <Brain className="h-5 w-5 text-gray-500" />;
    }
  };

  const getConfidenceLevel = (confidence) => {
    if (confidence >= 0.9) return 'Très élevée';
    if (confidence >= 0.8) return 'Élevée';
    if (confidence >= 0.7) return 'Moyenne';
    return 'Faible';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <Brain className="h-8 w-8 text-purple-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Prédictions IA</h2>
          <p className="text-gray-600">Recommandations intelligentes pour l'optimisation du stock</p>
        </div>
      </div>

      {/* Statistiques d'analyse */}
      {analysisData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Articles Analysés</p>
                <p className="text-2xl font-semibold text-gray-900">{analysisData.totalItems}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Taux de Consommation Moyen</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {Object.values(analysisData.consumptionRates).length > 0 ? 
                    (Object.values(analysisData.consumptionRates).reduce((sum, rate) => sum + rate.dailyRate, 0) / Object.values(analysisData.consumptionRates).length).toFixed(2) : 
                    '0'
                  }/jour
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Commandes Analysées</p>
                <p className="text-2xl font-semibold text-gray-900">{analysisData.totalCommandes}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Liste des prédictions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Recommandations IA ({predictions.length})
        </h3>

        {predictions.length === 0 ? (
          <div className="card text-center py-12">
            <Brain className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Aucune recommandation disponible</p>
            <p className="text-sm text-gray-400 mt-2">
              Les données sont en cours d'analyse...
            </p>
          </div>
        ) : (
          predictions.map((prediction) => (
            <div
              key={prediction.id}
              className={`card border-l-4 ${
                prediction.priority === 'high' ? 'border-red-500' :
                prediction.priority === 'medium' ? 'border-yellow-500' :
                'border-green-500'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {getTypeIcon(prediction.type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-medium text-gray-900">
                      {prediction.article}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(prediction.priority)}`}>
                        {prediction.priority === 'high' ? 'Haute' :
                         prediction.priority === 'medium' ? 'Moyenne' : 'Basse'} priorité
                      </span>
                      <span className="text-xs text-gray-500">
                        Confiance: {getConfidenceLevel(prediction.confidence)}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{prediction.message}</p>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-900 mb-1">Recommandation IA:</p>
                    <p className="text-sm text-gray-700">{prediction.recommendation}</p>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                    <span>Impact: {prediction.impact}</span>
                    <span>Confiance: {(prediction.confidence * 100).toFixed(0)}%</span>
                    <span>Type: {prediction.type}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <button
          onClick={generatePredictions}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Actualiser les Prédictions
        </button>
        <button
          onClick={() => {
            toast.success('Export des prédictions (à implémenter)');
          }}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Exporter les Recommandations
        </button>
      </div>
    </div>
  );
};

export default StockPredictionSimple;


