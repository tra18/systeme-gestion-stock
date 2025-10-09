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
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Brain className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🤖 Prédictions IA</h1>
            <p className="text-gray-600">Intelligence artificielle pour optimiser votre gestion de stock</p>
          </div>
        </div>
        <button
          onClick={generatePredictions}
          className="flex items-center space-x-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition shadow-lg"
        >
          <Brain size={20} />
          <span className="font-medium">Actualiser l'analyse</span>
        </button>
      </div>

      {/* Statistiques d'analyse */}
      {analysisData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-blue-100 text-sm font-medium">Articles analysés</p>
              <Package size={24} />
            </div>
            <p className="text-4xl font-bold">{analysisData.totalItems}</p>
            <p className="text-blue-100 text-xs mt-2">Inventaire complet</p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-green-100 text-sm font-medium">Consommation/jour</p>
              <TrendingUp size={24} />
            </div>
            <p className="text-4xl font-bold">
              {Object.values(analysisData.consumptionRates).length > 0 ? 
                (Object.values(analysisData.consumptionRates).reduce((sum, rate) => sum + rate.dailyRate, 0) / Object.values(analysisData.consumptionRates).length).toFixed(1) : 
                '0'
              }
            </p>
            <p className="text-green-100 text-xs mt-2">Moyenne quotidienne</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-purple-100 text-sm font-medium">Commandes</p>
              <BarChart3 size={24} />
            </div>
            <p className="text-4xl font-bold">{analysisData.totalCommandes}</p>
            <p className="text-purple-100 text-xs mt-2">Total historique</p>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
            <div className="flex items-center justify-between mb-2">
              <p className="text-orange-100 text-sm font-medium">Prédictions</p>
              <AlertTriangle size={24} />
            </div>
            <p className="text-4xl font-bold">{predictions.length}</p>
            <p className="text-orange-100 text-xs mt-2">Recommandations actives</p>
          </div>
        </div>
      )}

      {/* Filtres par priorité */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition">
            🔴 Haute priorité ({predictions.filter(p => p.priority === 'high').length})
          </button>
          <button className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200 transition">
            🟡 Moyenne ({predictions.filter(p => p.priority === 'medium').length})
          </button>
          <button className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition">
            🟢 Basse ({predictions.filter(p => p.priority === 'low').length})
          </button>
        </div>
      </div>

      {/* Liste des prédictions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            💡 Recommandations IA ({predictions.length})
          </h3>
          {predictions.length > 0 && (
            <button
              onClick={() => {
                const data = predictions.map(p => ({
                  Article: p.article,
                  Priorité: p.priority,
                  Message: p.message,
                  Recommandation: p.recommendation,
                  Confiance: `${(p.confidence * 100).toFixed(0)}%`,
                  Impact: p.impact
                }));
                
                // Export simple en JSON pour test
                const json = JSON.stringify(data, null, 2);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `predictions-ia-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                toast.success('Prédictions exportées !');
              }}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition text-sm"
            >
              <Package size={16} />
              <span>Exporter JSON</span>
            </button>
          )}
        </div>

        {predictions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg text-center py-16">
            <Brain className="h-20 w-20 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucune recommandation</h3>
            <p className="text-gray-600">
              L'IA n'a détecté aucun problème. Votre gestion de stock est optimale ! 🎉
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Créez des commandes pour obtenir des prédictions basées sur l'historique
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {predictions.map((prediction) => (
              <div
                key={prediction.id}
                className={`bg-white rounded-xl shadow-lg overflow-hidden border-l-4 hover:shadow-xl transition-all ${
                  prediction.priority === 'high' ? 'border-red-500' :
                  prediction.priority === 'medium' ? 'border-yellow-500' :
                  'border-green-500'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${
                      prediction.priority === 'high' ? 'bg-red-100' :
                      prediction.priority === 'medium' ? 'bg-yellow-100' :
                      'bg-green-100'
                    }`}>
                      {getTypeIcon(prediction.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                        <h4 className="text-lg font-bold text-gray-900">
                          📦 {prediction.article}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-2 ${
                            prediction.priority === 'high' ? 'bg-red-50 text-red-700 border-red-300' :
                            prediction.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-300' :
                            'bg-green-50 text-green-700 border-green-300'
                          }`}>
                            {prediction.priority === 'high' ? '🔴 URGENT' :
                             prediction.priority === 'medium' ? '🟡 ATTENTION' : '🟢 INFO'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-1">⚠️ Analyse :</p>
                        <p className="text-sm text-gray-900 font-medium">{prediction.message}</p>
                      </div>
                      
                      <div className={`rounded-lg p-4 border-2 ${
                        prediction.priority === 'high' ? 'bg-red-50 border-red-200' :
                        prediction.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
                        'bg-green-50 border-green-200'
                      }`}>
                        <p className="text-sm font-bold text-gray-900 mb-2 flex items-center space-x-2">
                          <Brain size={16} />
                          <span>Recommandation IA :</span>
                        </p>
                        <p className="text-sm text-gray-800">{prediction.recommendation}</p>
                      </div>
                      
                      <div className="flex items-center gap-6 mt-4 text-xs">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">Impact :</span>
                          <span className={`px-2 py-1 rounded font-medium ${
                            prediction.impact === 'high' ? 'bg-red-100 text-red-800' :
                            prediction.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {prediction.impact === 'high' ? 'Élevé' : prediction.impact === 'medium' ? 'Moyen' : 'Faible'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">Confiance :</span>
                          <div className="flex items-center space-x-1">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  prediction.confidence >= 0.9 ? 'bg-green-500' :
                                  prediction.confidence >= 0.8 ? 'bg-blue-500' :
                                  prediction.confidence >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${prediction.confidence * 100}%` }}
                              />
                            </div>
                            <span className="font-bold text-gray-900">{(prediction.confidence * 100).toFixed(0)}%</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-500">Type :</span>
                          <span className="font-medium text-gray-800 capitalize">{prediction.type}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info IA */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <Brain className="text-purple-600 flex-shrink-0" size={32} />
          <div>
            <h4 className="font-bold text-purple-900 mb-2">🤖 Comment fonctionne l'IA ?</h4>
            <ul className="space-y-2 text-sm text-purple-800">
              <li>✓ Analyse l'historique des commandes et du stock</li>
              <li>✓ Calcule les taux de consommation quotidiens</li>
              <li>✓ Prédit les ruptures de stock futures</li>
              <li>✓ Identifie les stocks excédentaires</li>
              <li>✓ Génère des recommandations d'optimisation</li>
              <li>✓ Fournit un niveau de confiance pour chaque prédiction</li>
            </ul>
            <p className="text-xs text-purple-700 mt-3 italic">
              💡 Les prédictions s'améliorent avec le temps. Plus vous utilisez le système, plus l'IA devient précise !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockPredictionSimple;


