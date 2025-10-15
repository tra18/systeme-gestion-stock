import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus, 
  Edit, 
  Eye, 
  Search, 
  Filter,
  User,
  Calendar,
  MessageSquare,
  Settings,
  Download,
  Star,
  Zap,
  Shield,
  Bug,
  AlertCircle,
  Activity
} from 'lucide-react';
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const IncidentManager = ({ employes }) => {
  const { userProfile } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    type: 'hardware', // hardware, software, network, security, other
    priorite: 'moyenne', // basse, moyenne, haute, critique
    statut: 'nouveau', // nouveau, assigne, en_cours, resolu, ferme
    assigneA: '',
    demandeur: userProfile?.uid || '',
    equipementId: '',
    dateResolution: '',
    solution: '',
    notes: '',
    numeroTicket: '',
    sla: '',
    tempsResolution: '',
    impact: 'moyen', // faible, moyen, élevé, critique
    urgence: 'moyenne' // faible, moyenne, élevée, critique
  });

  const incidentTypes = {
    hardware: { label: 'Matériel', icon: Settings, color: 'blue' },
    software: { label: 'Logiciel', icon: Bug, color: 'green' },
    network: { label: 'Réseau', icon: Zap, color: 'purple' },
    security: { label: 'Sécurité', icon: Shield, color: 'red' },
    other: { label: 'Autre', icon: AlertTriangle, color: 'gray' }
  };

  const priorityConfig = {
    basse: { label: 'Basse', color: 'green', icon: CheckCircle },
    moyenne: { label: 'Moyenne', color: 'yellow', icon: Clock },
    haute: { label: 'Haute', color: 'orange', icon: AlertTriangle },
    critique: { label: 'Critique', color: 'red', icon: XCircle }
  };

  const statusConfig = {
    nouveau: { label: 'Nouveau', color: 'blue', icon: Plus },
    assigne: { label: 'Assigné', color: 'yellow', icon: User },
    en_cours: { label: 'En cours', color: 'orange', icon: Clock },
    resolu: { label: 'Résolu', color: 'green', icon: CheckCircle },
    ferme: { label: 'Fermé', color: 'gray', icon: XCircle }
  };

  const impactConfig = {
    faible: { label: 'Faible', color: 'green', icon: CheckCircle },
    moyen: { label: 'Moyen', color: 'yellow', icon: Clock },
    eleve: { label: 'Élevé', color: 'orange', icon: AlertTriangle },
    critique: { label: 'Critique', color: 'red', icon: XCircle }
  };

  const urgenceConfig = {
    faible: { label: 'Faible', color: 'green', icon: CheckCircle },
    moyenne: { label: 'Moyenne', color: 'yellow', icon: Clock },
    elevee: { label: 'Élevée', color: 'orange', icon: AlertTriangle },
    critique: { label: 'Critique', color: 'red', icon: XCircle }
  };

  // Configuration SLA (Service Level Agreement)
  const slaConfig = {
    critique: { temps: 4, unite: 'heures', label: '4h (Critique)' },
    haute: { temps: 8, unite: 'heures', label: '8h (Haute)' },
    moyenne: { temps: 24, unite: 'heures', label: '24h (Moyenne)' },
    basse: { temps: 72, unite: 'heures', label: '72h (Basse)' }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      const incidentsQuery = query(
        collection(db, 'incidents_it'),
        orderBy('dateCreation', 'desc')
      );
      const snapshot = await getDocs(incidentsQuery);
      
      const incidentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Calculer les métriques SLA pour chaque incident
      const incidentsWithMetrics = incidentsData.map(incident => {
        const sla = slaConfig[incident.priorite] || slaConfig.moyenne;
        const dateCreation = new Date(incident.dateCreation);
        const now = new Date();
        const tempsEcoule = now - dateCreation;
        const tempsEcouleHeures = tempsEcoule / (1000 * 60 * 60);
        const slaEnHeures = sla.temps;
        
        let statutSLA = 'ok';
        if (tempsEcouleHeures > slaEnHeures) {
          statutSLA = 'depasse';
        } else if (tempsEcouleHeures > slaEnHeures * 0.8) {
          statutSLA = 'risque';
        }
        
        return {
          ...incident,
          tempsEcouleHeures,
          statutSLA,
          slaEnHeures
        };
      });
      
      setIncidents(incidentsWithMetrics);
    } catch (error) {
      console.error('Erreur lors du chargement des incidents:', error);
      toast.error('Erreur lors du chargement des incidents');
    } finally {
      setLoading(false);
    }
  };

  const generateTicketNumber = async () => {
    try {
      const incidentsQuery = query(
        collection(db, 'incidents_it'),
        orderBy('dateCreation', 'desc'),
        limit(1)
      );
      const snapshot = await getDocs(incidentsQuery);
      
      if (snapshot.empty) {
        return 'IT-2024-001';
      }
      
      const lastIncident = snapshot.docs[0].data();
      const lastNumber = lastIncident.numeroTicket || 'IT-2024-000';
      const match = lastNumber.match(/(\d+)$/);
      const nextNumber = match ? parseInt(match[1]) + 1 : 1;
      
      return `IT-2024-${nextNumber.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error('Erreur génération numéro ticket:', error);
      return `IT-2024-${Date.now().toString().slice(-3)}`;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let numeroTicket = formData.numeroTicket;
      
      // Générer un numéro de ticket si c'est un nouvel incident
      if (!selectedIncident && !numeroTicket) {
        numeroTicket = await generateTicketNumber();
      }
      
      // Calculer le SLA basé sur la priorité
      const sla = slaConfig[formData.priorite] || slaConfig.moyenne;
      
      const incidentData = {
        ...formData,
        numeroTicket,
        sla: sla.label,
        assigneNom: employes.find(emp => emp.id === formData.assigneA)?.nom || '',
        assignePrenom: employes.find(emp => emp.id === formData.assigneA)?.prenom || '',
        demandeurNom: employes.find(emp => emp.id === formData.demandeur)?.nom || '',
        demandeurPrenom: employes.find(emp => emp.id === formData.demandeur)?.prenom || '',
        dateCreation: selectedIncident?.dateCreation || new Date(),
        updatedAt: new Date(),
        createdBy: userProfile?.uid || 'system',
        createdByName: userProfile?.nom || 'Système'
      };

      if (selectedIncident) {
        await updateDoc(doc(db, 'incidents_it', selectedIncident.id), incidentData);
        toast.success('Incident modifié avec succès');
      } else {
        await addDoc(collection(db, 'incidents_it'), incidentData);
        toast.success(`Incident créé avec succès - Ticket: ${numeroTicket}`);
      }

      setShowCreateModal(false);
      setSelectedIncident(null);
      resetForm();
      loadIncidents();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde de l\'incident');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (incident) => {
    setSelectedIncident(incident);
    setFormData({
      titre: incident.titre || '',
      description: incident.description || '',
      type: incident.type || 'hardware',
      priorite: incident.priorite || 'moyenne',
      statut: incident.statut || 'nouveau',
      assigneA: incident.assigneA || '',
      demandeur: incident.demandeur || '',
      equipementId: incident.equipementId || '',
      dateResolution: incident.dateResolution || '',
      solution: incident.solution || '',
      notes: incident.notes || '',
      numeroTicket: incident.numeroTicket || '',
      sla: incident.sla || '',
      tempsResolution: incident.tempsResolution || '',
      impact: incident.impact || 'moyen',
      urgence: incident.urgence || 'moyenne'
    });
    setShowCreateModal(true);
  };

  const handleView = (incident) => {
    setSelectedIncident(incident);
    setShowDetailModal(true);
  };

  const handleDelete = async (incidentId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet incident ?')) {
      try {
        await deleteDoc(doc(db, 'incidents_it', incidentId));
        toast.success('Incident supprimé avec succès');
        loadIncidents();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      titre: '',
      description: '',
      type: 'hardware',
      priorite: 'moyenne',
      statut: 'nouveau',
      assigneA: '',
      demandeur: userProfile?.uid || '',
      equipementId: '',
      dateResolution: '',
      solution: '',
      notes: '',
      numeroTicket: '',
      sla: '',
      tempsResolution: '',
      impact: 'moyen',
      urgence: 'moyenne'
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(20, 184, 166);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('VITACH GUINÉE', 20, 20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Rapport des Incidents IT', 20, 25);
    
    // Date
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 150, 25);
    
    // Table
    const tableData = incidents.map(incident => {
      const typeInfo = incidentTypes[incident.type];
      const priorityInfo = priorityConfig[incident.priorite];
      const statusInfo = statusConfig[incident.statut];
      const assigne = employes.find(emp => emp.id === incident.assigneA);
      
      return [
        `#${incident.id.slice(-8)}`,
        incident.titre || 'N/A',
        typeInfo.label,
        priorityInfo.label,
        statusInfo.label,
        assigne ? `${assigne.nom} ${assigne.prenom}` : 'Non assigné',
        incident.dateCreation ? new Date(incident.dateCreation).toLocaleDateString('fr-FR') : 'N/A'
      ];
    });
    
    autoTable(doc, {
      startY: 40,
      head: [['N° Incident', 'Titre', 'Type', 'Priorité', 'Statut', 'Assigné à', 'Date Création']],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [20, 184, 166] },
      margin: { left: 20, right: 20 }
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFillColor(20, 184, 166);
      doc.rect(0, doc.internal.pageSize.height - 15, 210, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.text(`VITACH GUINÉE - Gestion des Incidents IT`, 20, doc.internal.pageSize.height - 8);
      doc.text(`Page ${i}/${pageCount}`, 180, doc.internal.pageSize.height - 8);
    }
    
    doc.save(`rapport_incidents_it_${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success('PDF généré avec succès');
  };

  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = !searchTerm || 
      incident.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || incident.statut === filterStatus;
    const matchesPriority = !filterPriority || incident.priorite === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: incidents.length,
    nouveau: incidents.filter(i => i.statut === 'nouveau').length,
    enCours: incidents.filter(i => i.statut === 'en_cours').length,
    resolu: incidents.filter(i => i.statut === 'resolu').length,
    critique: incidents.filter(i => i.priorite === 'critique').length,
    slaDepasse: incidents.filter(i => i.statutSLA === 'depasse').length,
    slaRisque: incidents.filter(i => i.statutSLA === 'risque').length,
    tempsResolutionMoyen: incidents
      .filter(i => i.statut === 'resolu' && i.dateResolution)
      .reduce((acc, i) => {
        const dateCreation = new Date(i.dateCreation);
        const dateResolution = new Date(i.dateResolution);
        const tempsResolution = (dateResolution - dateCreation) / (1000 * 60 * 60); // en heures
        return acc + tempsResolution;
      }, 0) / incidents.filter(i => i.statut === 'resolu' && i.dateResolution).length || 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Incidents IT</h2>
          <p className="text-gray-600">Suivi et résolution des incidents informatiques</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={generatePDF}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouvel Incident
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-8 w-8 text-teal-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Plus className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Nouveaux</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.nouveau}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">En cours</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.enCours}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Résolus</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.resolu}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Critiques</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.critique}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">SLA Dépassé</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.slaDepasse}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">SLA Risque</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.slaRisque}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Temps Moyen</dt>
                <dd className="text-lg font-medium text-gray-900">
                  {stats.tempsResolutionMoyen > 0 ? 
                    `${stats.tempsResolutionMoyen.toFixed(1)}h` : 
                    'N/A'
                  }
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher un incident..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(statusConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="">Toutes les priorités</option>
            {Object.entries(priorityConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Liste des incidents */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Incident
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priorité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigné à
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SLA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredIncidents.map((incident) => {
                const typeInfo = incidentTypes[incident.type];
                const priorityInfo = priorityConfig[incident.priorite];
                const statusInfo = statusConfig[incident.statut];
                const TypeIcon = typeInfo.icon;
                const PriorityIcon = priorityInfo.icon;
                const StatusIcon = statusInfo.icon;
                const assigne = employes.find(emp => emp.id === incident.assigneA);
                
                return (
                  <tr key={incident.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className={`h-10 w-10 rounded-full bg-${typeInfo.color}-100 flex items-center justify-center`}>
                            <TypeIcon className={`h-5 w-5 text-${typeInfo.color}-600`} />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {incident.titre || 'Sans titre'}
                          </div>
                          <div className="text-sm text-gray-500">
                            #{incident.id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${typeInfo.color}-100 text-${typeInfo.color}-800`}>
                        {typeInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${priorityInfo.color}-100 text-${priorityInfo.color}-800`}>
                        <PriorityIcon className="h-3 w-3 mr-1" />
                        {priorityInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {assigne ? `${assigne.nom} ${assigne.prenom}` : 'Non assigné'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {incident.statutSLA === 'depasse' && (
                          <AlertCircle className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        {incident.statutSLA === 'risque' && (
                          <Clock className="h-4 w-4 text-orange-500 mr-1" />
                        )}
                        {incident.statutSLA === 'ok' && (
                          <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${
                          incident.statutSLA === 'depasse' ? 'text-red-600' :
                          incident.statutSLA === 'risque' ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                          {incident.tempsEcouleHeures ? `${incident.tempsEcouleHeures.toFixed(1)}h` : 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {incident.dateCreation ? new Date(incident.dateCreation).toLocaleDateString('fr-FR') : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleView(incident)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Voir détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(incident)}
                          className="text-green-600 hover:text-green-800"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de création/édition */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedIncident ? 'Modifier l\'incident' : 'Nouvel incident IT'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedIncident(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Titre de l'incident *
                  </label>
                  <input
                    type="text"
                    value={formData.titre}
                    onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      required
                    >
                      {Object.entries(incidentTypes).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Priorité *
                    </label>
                    <select
                      value={formData.priorite}
                      onChange={(e) => setFormData({ ...formData, priorite: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      required
                    >
                      {Object.entries(priorityConfig).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Statut *
                    </label>
                    <select
                      value={formData.statut}
                      onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      required
                    >
                      {Object.entries(statusConfig).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Impact *
                    </label>
                    <select
                      value={formData.impact}
                      onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      required
                    >
                      {Object.entries(impactConfig).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Urgence *
                    </label>
                    <select
                      value={formData.urgence}
                      onChange={(e) => setFormData({ ...formData, urgence: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      required
                    >
                      {Object.entries(urgenceConfig).map(([key, config]) => (
                        <option key={key} value={key}>{config.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Assigné à
                    </label>
                    <select
                      value={formData.assigneA}
                      onChange={(e) => setFormData({ ...formData, assigneA: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="">Non assigné</option>
                      {employes.map((employe) => (
                        <option key={employe.id} value={employe.id}>
                          {employe.nom} {employe.prenom} - {employe.poste}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Demandeur
                    </label>
                    <select
                      value={formData.demandeur}
                      onChange={(e) => setFormData({ ...formData, demandeur: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    >
                      {employes.map((employe) => (
                        <option key={employe.id} value={employe.id}>
                          {employe.nom} {employe.prenom} - {employe.poste}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    ID Équipement
                  </label>
                  <input
                    type="text"
                    value={formData.equipementId}
                    onChange={(e) => setFormData({ ...formData, equipementId: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Référence de l'équipement concerné"
                  />
                </div>

                {formData.statut === 'resolu' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Date de résolution
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.dateResolution}
                        onChange={(e) => setFormData({ ...formData, dateResolution: e.target.value })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Solution appliquée
                      </label>
                      <textarea
                        value={formData.solution}
                        onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                        rows={3}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                        placeholder="Décrivez la solution appliquée..."
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Notes supplémentaires
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Notes et commentaires..."
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setSelectedIncident(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700 disabled:opacity-50 flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Enregistrement...
                      </>
                    ) : (
                      <>
                        <Settings className="h-4 w-4 mr-2" />
                        Enregistrer
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détail */}
      {showDetailModal && selectedIncident && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Détail de l'incident #{selectedIncident.id.slice(-8)}
                </h3>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedIncident(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Informations générales */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Informations générales</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Titre:</span>
                      <p className="font-medium">{selectedIncident.titre}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <p className="font-medium">{incidentTypes[selectedIncident.type]?.label}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Priorité:</span>
                      <p className="font-medium">{priorityConfig[selectedIncident.priorite]?.label}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Statut:</span>
                      <p className="font-medium">{statusConfig[selectedIncident.statut]?.label}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Assigné à:</span>
                      <p className="font-medium">
                        {selectedIncident.assigneNom ? 
                          `${selectedIncident.assigneNom} ${selectedIncident.assignePrenom}` : 
                          'Non assigné'
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Demandeur:</span>
                      <p className="font-medium">
                        {selectedIncident.demandeurNom ? 
                          `${selectedIncident.demandeurNom} ${selectedIncident.demandeurPrenom}` : 
                          'Non spécifié'
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Date de création:</span>
                      <p className="font-medium">
                        {selectedIncident.dateCreation ? 
                          new Date(selectedIncident.dateCreation).toLocaleString('fr-FR') : 
                          'N/A'
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Dernière mise à jour:</span>
                      <p className="font-medium">
                        {selectedIncident.updatedAt ? 
                          new Date(selectedIncident.updatedAt).toLocaleString('fr-FR') : 
                          'N/A'
                        }
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Impact:</span>
                      <p className="font-medium">{impactConfig[selectedIncident.impact]?.label}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Urgence:</span>
                      <p className="font-medium">{urgenceConfig[selectedIncident.urgence]?.label}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">SLA:</span>
                      <p className="font-medium">{selectedIncident.sla || 'Non défini'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Numéro Ticket:</span>
                      <p className="font-medium">{selectedIncident.numeroTicket || 'Non généré'}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h5 className="font-medium text-gray-900 mb-2">Description</h5>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {selectedIncident.description}
                  </p>
                </div>

                {/* Solution */}
                {selectedIncident.solution && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Solution appliquée</h5>
                    <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
                      {selectedIncident.solution}
                    </p>
                  </div>
                )}

                {/* Notes */}
                {selectedIncident.notes && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">Notes</h5>
                    <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                      {selectedIncident.notes}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setSelectedIncident(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleEdit(selectedIncident);
                  }}
                  className="px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700"
                >
                  Modifier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncidentManager;
