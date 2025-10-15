import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock,
  Database
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const TestRunnerSimple = () => {
  const { userProfile } = useAuth();
  const [tests, setTests] = useState([
    {
      id: 'auth-login',
      name: 'Connexion utilisateur',
      description: 'Test de connexion avec identifiants valides',
      category: 'authentication',
      priority: 'high',
      status: 'pending'
    },
    {
      id: 'stock-create',
      name: 'Création d\'article',
      description: 'Test de création d\'un nouvel article',
      category: 'stock',
      priority: 'high',
      status: 'pending'
    },
    {
      id: 'commande-create',
      name: 'Création de commande',
      description: 'Test de création d\'une nouvelle commande',
      category: 'commandes',
      priority: 'high',
      status: 'pending'
    },
    {
      id: 'ui-responsive',
      name: 'Responsivité',
      description: 'Test de la responsivité sur différents écrans',
      category: 'ui',
      priority: 'medium',
      status: 'pending'
    }
  ]);
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);

  const runTest = async (testId) => {
    const test = tests.find(t => t.id === testId);
    if (!test) return;

    try {
      // Simuler l'exécution du test
      const result = await simulateTestExecution(test);
      
      setTestResults(prev => ({
        ...prev,
        [testId]: result
      }));

      // Mettre à jour le statut du test
      setTests(prev => prev.map(t => 
        t.id === testId ? { ...t, status: result.status } : t
      ));

      return result;
    } catch (error) {
      console.error('Erreur lors de l\'exécution du test:', error);
      return {
        status: 'failed',
        message: 'Erreur lors de l\'exécution',
        duration: 0
      };
    }
  };

  const simulateTestExecution = async (test) => {
    // Simuler le temps d'exécution
    const duration = Math.random() * 2000 + 500;
    await new Promise(resolve => setTimeout(resolve, duration));

    // Simuler le résultat (90% de succès)
    const success = Math.random() > 0.1;
    
    return {
      status: success ? 'passed' : 'failed',
      message: success ? 'Test réussi' : 'Test échoué',
      duration: Math.round(duration),
      timestamp: new Date()
    };
  };

  const runAllTests = async () => {
    setIsRunning(true);
    const results = {};

    try {
      for (const test of tests) {
        const result = await runTest(test.id);
        results[test.id] = result;
        
        // Petite pause entre les tests
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      toast.success(`Tests terminés: ${Object.values(results).filter(r => r.status === 'passed').length}/${tests.length} réussis`);
    } catch (error) {
      console.error('Erreur lors de l\'exécution des tests:', error);
      toast.error('Erreur lors de l\'exécution des tests');
    } finally {
      setIsRunning(false);
    }
  };

  const getTestStatusIcon = (testId) => {
    const result = testResults[testId];
    if (!result) return <Clock className="h-4 w-4 text-gray-400" />;
    
    switch (result.status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTestStatusColor = (testId) => {
    const result = testResults[testId];
    if (!result) return 'text-gray-600 bg-gray-50';
    
    switch (result.status) {
      case 'passed': return 'text-green-600 bg-green-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTestStats = () => {
    const total = tests.length;
    const passed = Object.values(testResults).filter(r => r.status === 'passed').length;
    const failed = Object.values(testResults).filter(r => r.status === 'failed').length;
    const pending = total - passed - failed;

    return { total, passed, failed, pending };
  };

  const stats = getTestStats();

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tests Automatisés</h2>
          <p className="text-gray-600">Exécution et monitoring des tests</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-800 rounded-lg">
            <Database className="h-4 w-4" />
            <span className="text-sm font-medium">
              Couverture: {Math.round((stats.passed / stats.total) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Database className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Réussis</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.passed}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Échoués</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.failed}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">En Attente</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Actions</h3>
          <div className="flex gap-2">
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Play className="h-4 w-4" />
              {isRunning ? 'En cours...' : 'Exécuter Tous'}
            </button>
          </div>
        </div>
      </div>

      {/* Liste des tests */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tests Individuels</h3>
        <div className="space-y-3">
          {tests.map((test) => (
            <div
              key={test.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${getTestStatusColor(test.id)}`}
            >
              <div className="flex items-center gap-3">
                {getTestStatusIcon(test.id)}
                <div>
                  <h4 className="font-medium text-gray-900">{test.name}</h4>
                  <p className="text-sm text-gray-600">{test.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(test.priority)}`}>
                      {test.priority}
                    </span>
                    <span className="text-xs text-gray-500">{test.category}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {testResults[test.id] && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {testResults[test.id].duration}ms
                    </p>
                    <p className="text-xs text-gray-500">
                      {testResults[test.id].timestamp?.toLocaleTimeString()}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => runTest(test.id)}
                  disabled={isRunning}
                  className="px-3 py-1 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  Exécuter
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestRunnerSimple;




