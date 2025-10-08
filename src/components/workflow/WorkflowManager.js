import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  ArrowRight,
  Settings,
  Play,
  Pause,
  RotateCcw,
  X
} from 'lucide-react';
import { collection, query, orderBy, getDocs, where, updateDoc, doc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const WorkflowManager = () => {
  const { userProfile } = useAuth();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  // Définition des workflows prédéfinis
  const predefinedWorkflows = {
    commande_approbation: {
      id: 'commande_approbation',
      name: 'Workflow d\'Approbation des Commandes',
      description: 'Processus d\'approbation des commandes avec validation multi-niveaux',
      steps: [
        {
          id: 'creation',
          name: 'Création de la Commande',
          description: 'Le service crée une nouvelle commande',
          role: 'service',
          status: 'pending',
          order: 1,
          required: true,
          autoAdvance: false
        },
        {
          id: 'prix_ajout',
          name: 'Ajout du Prix',
          description: 'Le service achat ajoute le prix à la commande',
          role: 'achat',
          status: 'pending',
          order: 2,
          required: true,
          autoAdvance: false
        },
        {
          id: 'validation_dg',
          name: 'Validation DG',
          description: 'Le Directeur Général valide la commande',
          role: 'dg',
          status: 'pending',
          order: 3,
          required: true,
          autoAdvance: false
        },
        {
          id: 'execution',
          name: 'Exécution',
          description: 'La commande est exécutée et livrée',
          role: 'achat',
          status: 'pending',
          order: 4,
          required: true,
          autoAdvance: true
        }
      ],
      active: true,
      createdAt: new Date()
    },
    stock_alert: {
      id: 'stock_alert',
      name: 'Workflow d\'Alerte Stock',
      description: 'Processus automatique de gestion des alertes de stock',
      steps: [
        {
          id: 'detection',
          name: 'Détection d\'Alerte',
          description: 'Système détecte un stock faible ou rupture',
          role: 'system',
          status: 'completed',
          order: 1,
          required: true,
          autoAdvance: true
        },
        {
          id: 'notification',
          name: 'Notification',
          description: 'Notification automatique aux responsables',
          role: 'system',
          status: 'completed',
          order: 2,
          required: true,
          autoAdvance: true
        },
        {
          id: 'commande_auto',
          name: 'Commande Automatique',
          description: 'Génération automatique d\'une commande de réapprovisionnement',
          role: 'system',
          status: 'pending',
          order: 3,
          required: false,
          autoAdvance: false
        },
        {
          id: 'validation_manuelle',
          name: 'Validation Manuelle',
          description: 'Validation manuelle par le service achat',
          role: 'achat',
          status: 'pending',
          order: 4,
          required: true,
          autoAdvance: false
        }
      ],
      active: true,
      createdAt: new Date()
    },
    maintenance_planning: {
      id: 'maintenance_planning',
      name: 'Workflow de Planification Maintenance',
      description: 'Processus de planification et suivi des maintenances',
      steps: [
        {
          id: 'planification',
          name: 'Planification',
          description: 'Planification des maintenances préventives',
          role: 'maintenance',
          status: 'pending',
          order: 1,
          required: true,
          autoAdvance: false
        },
        {
          id: 'approbation_budget',
          name: 'Approbation Budget',
          description: 'Validation du budget par la direction',
          role: 'dg',
          status: 'pending',
          order: 2,
          required: true,
          autoAdvance: false
        },
        {
          id: 'execution',
          name: 'Exécution',
          description: 'Exécution des travaux de maintenance',
          role: 'maintenance',
          status: 'pending',
          order: 3,
          required: true,
          autoAdvance: false
        },
        {
          id: 'validation_qualite',
          name: 'Validation Qualité',
          description: 'Contrôle qualité et validation des travaux',
          role: 'maintenance',
          status: 'pending',
          order: 4,
          required: true,
          autoAdvance: false
        }
      ],
      active: true,
      createdAt: new Date()
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      
      // Charger les workflows depuis Firestore
      const workflowsQuery = query(
        collection(db, 'workflows'),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(workflowsQuery);
      const workflowsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Si aucun workflow n'existe, initialiser avec les workflows prédéfinis
      if (workflowsData.length === 0) {
        await initializePredefinedWorkflows();
        setWorkflows(Object.values(predefinedWorkflows));
      } else {
        setWorkflows(workflowsData);
      }

    } catch (error) {
      console.error('Erreur lors du chargement des workflows:', error);
      toast.error('Erreur lors du chargement des workflows');
    } finally {
      setLoading(false);
    }
  };

  const initializePredefinedWorkflows = async () => {
    try {
      const workflowsCollection = collection(db, 'workflows');
      
      for (const workflow of Object.values(predefinedWorkflows)) {
        await addDoc(workflowsCollection, workflow);
      }
      
      toast.success('Workflows prédéfinis initialisés');
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
    }
  };

  const getStepStatus = (step, workflow) => {
    // Logique pour déterminer le statut d'une étape
    if (step.status === 'completed') return 'completed';
    if (step.status === 'in_progress') return 'in_progress';
    if (step.status === 'blocked') return 'blocked';
    return 'pending';
  };

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'blocked': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-50 border-green-200 text-green-800';
      case 'in_progress': return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'blocked': return 'bg-red-50 border-red-200 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const canUserAccessStep = (step, userRole) => {
    if (step.role === 'system') return true;
    if (step.role === userRole) return true;
    if (userRole === 'dg') return true; // Le DG peut accéder à toutes les étapes
    return false;
  };

  const advanceWorkflow = async (workflowId, stepId) => {
    try {
      const workflow = workflows.find(w => w.id === workflowId);
      if (!workflow) return;

      const stepIndex = workflow.steps.findIndex(s => s.id === stepId);
      if (stepIndex === -1) return;

      // Marquer l'étape comme terminée
      const updatedSteps = [...workflow.steps];
      updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], status: 'completed' };

      // Avancer à l'étape suivante si autoAdvance est activé
      if (updatedSteps[stepIndex].autoAdvance && stepIndex < updatedSteps.length - 1) {
        updatedSteps[stepIndex + 1] = { ...updatedSteps[stepIndex + 1], status: 'in_progress' };
      }

      // Mettre à jour le workflow
      await updateDoc(doc(db, 'workflows', workflowId), {
        steps: updatedSteps,
        updatedAt: new Date(),
        updatedBy: userProfile.uid
      });

      toast.success('Workflow mis à jour avec succès');
      loadWorkflows();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du workflow:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getWorkflowProgress = (workflow) => {
    const completedSteps = workflow.steps.filter(step => step.status === 'completed').length;
    const totalSteps = workflow.steps.length;
    return Math.round((completedSteps / totalSteps) * 100);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Workflows</h2>
          <p className="text-gray-600">Processus automatisés et workflows multi-niveaux</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadWorkflows}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Actualiser
          </button>
          <button
            onClick={() => {
              toast.info('Création de workflow personnalisé (à implémenter)');
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Settings className="h-4 w-4 mr-2" />
            Nouveau Workflow
          </button>
        </div>
      </div>

      {/* Liste des workflows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {workflows.map((workflow) => (
          <div key={workflow.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                <p className="text-sm text-gray-600">{workflow.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  workflow.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {workflow.active ? 'Actif' : 'Inactif'}
                </span>
                <button
                  onClick={() => setSelectedWorkflow(workflow)}
                  className="text-primary-600 hover:text-primary-800"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Barre de progression */}
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progression</span>
                <span>{getWorkflowProgress(workflow)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getWorkflowProgress(workflow)}%` }}
                ></div>
              </div>
            </div>

            {/* Étapes du workflow */}
            <div className="space-y-3">
              {workflow.steps.map((step, index) => {
                const stepStatus = getStepStatus(step, workflow);
                const canAccess = canUserAccessStep(step, userProfile?.role);
                
                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      stepStatus === 'completed' ? 'bg-green-50 border-green-200' :
                      stepStatus === 'in_progress' ? 'bg-blue-50 border-blue-200' :
                      stepStatus === 'blocked' ? 'bg-red-50 border-red-200' :
                      'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {getStepIcon(stepStatus)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">
                          {step.name}
                        </h4>
                        <span className="text-xs text-gray-500">
                          Étape {step.order}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        {step.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500">
                          Rôle: {step.role}
                        </span>
                        {step.required && (
                          <span className="text-xs text-red-600 font-medium">
                            Requis
                          </span>
                        )}
                        {step.autoAdvance && (
                          <span className="text-xs text-blue-600 font-medium">
                            Auto-avance
                          </span>
                        )}
                      </div>
                    </div>

                    {canAccess && stepStatus === 'in_progress' && (
                      <button
                        onClick={() => advanceWorkflow(workflow.id, step.id)}
                        className="flex-shrink-0 p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                        title="Marquer comme terminé"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Actions du workflow */}
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  toast.info('Pause du workflow (à implémenter)');
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
              >
                <Pause className="h-3 w-3 mr-1" />
                Pause
              </button>
              <button
                onClick={() => {
                  toast.info('Redémarrage du workflow (à implémenter)');
                }}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Redémarrer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de détails du workflow */}
      {selectedWorkflow && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedWorkflow.name}
                </h3>
                <button
                  onClick={() => setSelectedWorkflow(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <p className="text-gray-600 mb-6">{selectedWorkflow.description}</p>
              
              {/* Détails des étapes */}
              <div className="space-y-4">
                {selectedWorkflow.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {getStepIcon(getStepStatus(step, selectedWorkflow))}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{step.name}</h4>
                      <p className="text-sm text-gray-600">{step.description}</p>
                    </div>
                    {index < selectedWorkflow.steps.length - 1 && (
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowManager;
