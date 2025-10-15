import React, { useState, useEffect } from 'react';
import { Users, FileText, Download, Calendar, User } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

const PayrollManager = ({ employes = [] }) => {
  const [selectedEmploye, setSelectedEmploye] = useState('');
  const [periode, setPeriode] = useState('');
  const [mois, setMois] = useState(new Date().getMonth() + 1);
  const [annee, setAnnee] = useState(new Date().getFullYear());

  // Fonction utilitaire pour formater les prix
  const formatPrice = (price) => {
    if (!price && price !== 0) return '0 GNF';
    
    let cleanPrice = String(price).trim();
    cleanPrice = cleanPrice.replace(/[^\d.,]/g, '');
    cleanPrice = cleanPrice.replace(',', '.');
    
    const numPrice = parseFloat(cleanPrice);
    if (isNaN(numPrice)) return '0 GNF';
    
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numPrice) + ' GNF';
  };

  // Calculer les cotisations et charges
  const calculateDeductions = (salaire) => {
    const salaireNum = parseFloat(String(salaire).replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
    
    // Cotisations sociales (exemple : 15% du salaire)
    const cotisationsSociales = salaireNum * 0.15;
    
    // RTS (Retenue à la Source) - exemple progressif
    let rts = 0;
    if (salaireNum > 500000) {
      rts = (salaireNum - 500000) * 0.20; // 20% au-dessus de 500,000 GNF
    }
    
    // Autres déductions (exemple : retenue sur salaire)
    const autresDeductions = salaireNum * 0.05; // 5%
    
    const totalDeductions = cotisationsSociales + rts + autresDeductions;
    const netAPayer = salaireNum - totalDeductions;
    
    return {
      cotisationsSociales,
      rts,
      autresDeductions,
      totalDeductions,
      netAPayer
    };
  };

  // Générer bulletin de paie individuel
  const generateIndividualPayroll = async () => {
    if (!selectedEmploye) {
      toast.error('Veuillez sélectionner un employé');
      return;
    }

    try {
      const employe = employes.find(e => e.id === selectedEmploye);
      if (!employe) {
        toast.error('Employé non trouvé');
        return;
      }

      const doc = new jsPDF();
      
      // En-tête professionnel
      doc.setFillColor(20, 184, 166);
      doc.rect(0, 0, 210, 30, 'F');
      
      // Logo et titre
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('VITACH GUINÉE', 20, 15);
      
      doc.setFontSize(12);
      doc.text('Système de Gestion Intégré', 20, 22);
      
      // Titre du document
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('BULLETIN DE PAIE', 20, 45);
      
      // Période
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const moisNom = new Date(annee, mois - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      doc.text(`Période: ${moisNom}`, 20, 55);
      doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 20, 62);
      
      // Informations employé
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMATIONS EMPLOYÉ', 20, 75);
      
      doc.setFont('helvetica', 'normal');
      doc.text(`Nom: ${employe.nom}`, 20, 85);
      doc.text(`Prénom: ${employe.prenom || 'N/A'}`, 20, 92);
      doc.text(`Poste: ${employe.poste}`, 20, 99);
      doc.text(`Service: ${employe.service || 'N/A'}`, 20, 106);
      doc.text(`Email: ${employe.email}`, 20, 113);
      
      // Calculs de paie
      const salaireBrut = parseFloat(String(employe.salaire || 0).replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
      const deductions = calculateDeductions(salaireBrut);
      
      // Tableau des éléments de paie
      const payrollData = [
        ['Éléments', 'Base', 'Taux/Quantité', 'Montant'],
        ['Salaire de base', formatPrice(salaireBrut), '100%', formatPrice(salaireBrut)],
        ['', '', '', ''],
        ['COTISATIONS ET DÉDUCTIONS', '', '', ''],
        ['Cotisations sociales', formatPrice(salaireBrut), '15%', formatPrice(deductions.cotisationsSociales)],
        ['RTS', formatPrice(salaireBrut), '20%', formatPrice(deductions.rts)],
        ['Autres déductions', formatPrice(salaireBrut), '5%', formatPrice(deductions.autresDeductions)],
        ['', '', '', ''],
        ['TOTAL DÉDUCTIONS', '', '', formatPrice(deductions.totalDeductions)],
        ['', '', '', ''],
        ['NET À PAYER', '', '', formatPrice(deductions.netAPayer)]
      ];
      
      autoTable(doc, {
        head: [['Éléments', 'Base', 'Taux/Quantité', 'Montant']],
        body: payrollData,
        startY: 125,
        styles: {
          fontSize: 10,
          cellPadding: 5
        },
        headStyles: {
          fillColor: [20, 184, 166],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 70 },
          1: { cellWidth: 40 },
          2: { cellWidth: 40 },
          3: { cellWidth: 40 }
        }
      });
      
      // Pied de page
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(20, 184, 166);
        doc.rect(0, 285, 210, 15, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text('VITACH GUINÉE - Système de Gestion Intégré', 20, 292);
        doc.text(`Page ${i}/${pageCount}`, 180, 292);
      }
      
      // Télécharger le PDF
      const fileName = `Bulletin_Paie_${employe.nom}_${moisNom.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);
      
      toast.success('Bulletin de paie généré avec succès !');
      
    } catch (error) {
      console.error('Erreur génération bulletin:', error);
      toast.error('Erreur lors de la génération du bulletin de paie');
    }
  };

  // Générer état de salaire global
  const generateGlobalPayroll = async () => {
    try {
      const doc = new jsPDF();
      
      // En-tête professionnel
      doc.setFillColor(20, 184, 166);
      doc.rect(0, 0, 210, 30, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('VITACH GUINÉE', 20, 15);
      
      doc.setFontSize(12);
      doc.text('Système de Gestion Intégré', 20, 22);
      
      // Titre
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('ÉTAT DE SALAIRES', 20, 45);
      
      const moisNom = new Date(annee, mois - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Période: ${moisNom}`, 20, 55);
      doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 20, 62);
      
      // Calculs globaux
      let totalSalaireBrut = 0;
      let totalDeductions = 0;
      let totalNetAPayer = 0;
      
      const payrollData = employes
        .filter(emp => emp.actif !== false)
        .map(emp => {
          const salaireBrut = parseFloat(String(emp.salaire || 0).replace(/[^\d.,]/g, '').replace(',', '.')) || 0;
          const deductions = calculateDeductions(salaireBrut);
          
          totalSalaireBrut += salaireBrut;
          totalDeductions += deductions.totalDeductions;
          totalNetAPayer += deductions.netAPayer;
          
          return [
            `${emp.nom} ${emp.prenom || ''}`.trim(),
            emp.poste || 'N/A',
            emp.service || 'N/A',
            formatPrice(salaireBrut),
            formatPrice(deductions.totalDeductions),
            formatPrice(deductions.netAPayer)
          ];
        });
      
      // Ajouter ligne de totaux
      payrollData.push([
        'TOTAL GÉNÉRAL',
        '',
        '',
        formatPrice(totalSalaireBrut),
        formatPrice(totalDeductions),
        formatPrice(totalNetAPayer)
      ]);
      
      autoTable(doc, {
        head: [['Employé', 'Poste', 'Service', 'Salaire Brut', 'Déductions', 'Net à Payer']],
        body: payrollData,
        startY: 75,
        styles: {
          fontSize: 9,
          cellPadding: 4
        },
        headStyles: {
          fillColor: [20, 184, 166],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252]
        },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 35 },
          2: { cellWidth: 35 },
          3: { cellWidth: 30 },
          4: { cellWidth: 30 },
          5: { cellWidth: 30 }
        },
        didDrawPage: (data) => {
          // Mettre en évidence la ligne de totaux
          if (data.pageNumber === data.pageCount) {
            const table = data.table;
            const lastRow = table.body.length - 1;
            if (lastRow >= 0) {
              doc.setFillColor(255, 235, 59);
              doc.rect(table.startX, table.startY + (lastRow * table.rowHeight), 
                      table.width, table.rowHeight, 'F');
            }
          }
        }
      });
      
      // Pied de page
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFillColor(20, 184, 166);
        doc.rect(0, 285, 210, 15, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text('VITACH GUINÉE - Système de Gestion Intégré', 20, 292);
        doc.text(`Page ${i}/${pageCount}`, 180, 292);
      }
      
      // Télécharger le PDF
      const fileName = `Etat_Salaires_${moisNom.replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);
      
      toast.success('État de salaires généré avec succès !');
      
    } catch (error) {
      console.error('Erreur génération état salaires:', error);
      toast.error('Erreur lors de la génération de l\'état de salaires');
    }
  };

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">💰 Gestion de la Paie</h2>
          <p className="text-gray-600">Génération de bulletins de paie et états de salaires</p>
        </div>
        <div className="flex items-center space-x-2 text-teal-600">
          <Users size={24} />
        </div>
      </div>

      {/* Sélection de période */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mois
          </label>
          <select
            value={mois}
            onChange={(e) => setMois(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(currentYear, i).toLocaleDateString('fr-FR', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Année
          </label>
          <select
            value={annee}
            onChange={(e) => setAnnee(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = currentYear - 2 + i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Période sélectionnée
          </label>
          <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700">
            {new Date(annee, mois - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Section Bulletin individuel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <User className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold text-blue-800">Bulletin de Paie Individuel</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner un employé
            </label>
            <select
              value={selectedEmploye}
              onChange={(e) => setSelectedEmploye(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Choisir un employé --</option>
              {employes
                .filter(emp => emp.actif !== false)
                .map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nom} {emp.prenom || ''} - {emp.poste}
                  </option>
                ))}
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={generateIndividualPayroll}
              disabled={!selectedEmploye}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              <FileText size={20} />
              <span>Générer Bulletin Individuel</span>
            </button>
          </div>
        </div>
        
        <div className="text-sm text-blue-700">
          <p>📋 Génère un bulletin de paie détaillé pour l'employé sélectionné avec :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Informations personnelles et professionnelles</li>
            <li>Calcul détaillé des cotisations sociales</li>
            <li>Déduction RTS (Retenue à la Source)</li>
            <li>Autres déductions et retenues</li>
            <li>Net à payer</li>
          </ul>
        </div>
      </div>

      {/* Section État global */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Users className="text-green-600" size={24} />
          <h3 className="text-lg font-semibold text-green-800">État de Salaires Global</h3>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-green-700">
            <p>📊 Génère un état récapitulatif de tous les salaires pour la période sélectionnée</p>
            <p className="mt-1">
              <strong>{employes.filter(emp => emp.actif !== false).length}</strong> employés actifs
            </p>
          </div>
          
          <button
            onClick={generateGlobalPayroll}
            className="flex items-center space-x-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <Download size={20} />
            <span>Générer État Global</span>
          </button>
        </div>
        
        <div className="text-sm text-green-700">
          <p>📋 L'état global inclut :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Liste de tous les employés actifs</li>
            <li>Salaire brut, déductions et net à payer par employé</li>
            <li>Totaux généraux (masse salariale)</li>
            <li>Répartition par service et poste</li>
          </ul>
        </div>
      </div>

      {/* Informations sur les calculs */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h4 className="font-semibold text-yellow-800 mb-2">ℹ️ Informations sur les calculs</h4>
        <div className="text-sm text-yellow-700 space-y-1">
          <p><strong>Cotisations sociales :</strong> 15% du salaire brut</p>
          <p><strong>RTS (Retenue à la Source) :</strong> 20% sur la part au-dessus de 500,000 GNF</p>
          <p><strong>Autres déductions :</strong> 5% du salaire brut</p>
          <p><em>Ces taux sont des exemples et peuvent être ajustés selon votre politique RH.</em></p>
        </div>
      </div>
    </div>
  );
};

export default PayrollManager;
