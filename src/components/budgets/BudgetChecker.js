import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, DollarSign, TrendingDown } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

const BudgetChecker = ({ service, montantCommande }) => {
  const [budgetInfo, setBudgetInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (service && montantCommande) {
      checkBudget();
    }
  }, [service, montantCommande]);

  const checkBudget = async () => {
    setLoading(true);
    try {
      const currentDate = new Date();
      const annee = currentDate.getFullYear();
      const mois = currentDate.getMonth() + 1;

      // Chercher le budget du service pour le mois/année en cours
      const budgetsSnap = await getDocs(collection(db, 'budgets'));
      const budgets = budgetsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const budget = budgets.find(b => 
        b.service === service && 
        b.annee === annee &&
        (b.periode === 'annuel' || b.mois === mois)
      );

      if (!budget) {
        setBudgetInfo({
          exists: false,
          message: 'Aucun budget défini pour ce service'
        });
        setLoading(false);
        return;
      }

      // Calculer les dépenses actuelles
      const commandesSnap = await getDocs(collection(db, 'commandes'));
      const commandes = commandesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const depensesActuelles = commandes
        .filter(cmd => {
          if (cmd.service !== service || cmd.statut !== 'approuve') return false;
          const cmdDate = cmd.createdAt?.toDate?.();
          if (!cmdDate) return false;
          
          if (budget.periode === 'mensuel') {
            return cmdDate.getFullYear() === annee && cmdDate.getMonth() + 1 === mois;
          } else {
            return cmdDate.getFullYear() === annee;
          }
        })
        .reduce((sum, cmd) => sum + (cmd.prix || 0), 0);

      const depensesAvecNouvelle = depensesActuelles + parseFloat(montantCommande || 0);
      const reste = budget.montantTotal - depensesAvecNouvelle;
      const pourcentage = (depensesAvecNouvelle / budget.montantTotal) * 100;

      setBudgetInfo({
        exists: true,
        budget: budget.montantTotal,
        depenses: depensesActuelles,
        nouvelle: parseFloat(montantCommande || 0),
        total: depensesAvecNouvelle,
        reste: reste,
        pourcentage: pourcentage,
        depassement: reste < 0,
        alerte: pourcentage > 80 && reste >= 0,
        periode: budget.periode
      });
    } catch (error) {
      console.error('Erreur vérification budget:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !budgetInfo) {
    return null;
  }

  if (!budgetInfo.exists) {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
        <div className="flex items-start space-x-3">
          <DollarSign className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-blue-900">Information budgétaire</p>
            <p className="text-xs text-blue-700 mt-1">
              {budgetInfo.message}. La commande pourra être créée mais sans contrôle budgétaire.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Budget dépassé
  if (budgetInfo.depassement) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-900">⚠️ Dépassement de budget</p>
            <p className="text-xs text-red-700 mt-1">
              Cette commande dépasserait le budget de <strong>{new Intl.NumberFormat('fr-FR').format(Math.abs(budgetInfo.reste))} GNF</strong>
            </p>
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-red-700">Budget {budgetInfo.periode}</span>
                <span className="font-medium">{new Intl.NumberFormat('fr-FR').format(budgetInfo.budget)} GNF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-700">Dépenses actuelles</span>
                <span className="font-medium">{new Intl.NumberFormat('fr-FR').format(budgetInfo.depenses)} GNF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-700">Cette commande</span>
                <span className="font-medium">+{new Intl.NumberFormat('fr-FR').format(budgetInfo.nouvelle)} GNF</span>
              </div>
              <div className="flex justify-between border-t border-red-300 pt-1 mt-1">
                <span className="text-red-900 font-bold">Total</span>
                <span className="font-bold text-red-900">{new Intl.NumberFormat('fr-FR').format(budgetInfo.total)} GNF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-red-900 font-bold">Dépassement</span>
                <span className="font-bold text-red-900">-{new Intl.NumberFormat('fr-FR').format(Math.abs(budgetInfo.reste))} GNF</span>
              </div>
            </div>
            {/* Barre de progression */}
            <div className="mt-3">
              <div className="w-full bg-red-200 rounded-full h-2 overflow-hidden">
                <div className="h-2 bg-red-600" style={{ width: '100%' }} />
              </div>
              <p className="text-xs text-red-700 mt-1 text-right font-bold">{budgetInfo.pourcentage.toFixed(1)}% utilisé</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Budget proche de la limite (>80%)
  if (budgetInfo.alerte) {
    return (
      <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-sm font-bold text-orange-900">⚠️ Attention - Budget proche de la limite</p>
            <p className="text-xs text-orange-700 mt-1">
              Après cette commande, il restera <strong>{new Intl.NumberFormat('fr-FR').format(budgetInfo.reste)} GNF</strong>
            </p>
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-orange-700">Budget {budgetInfo.periode}</span>
                <span className="font-medium">{new Intl.NumberFormat('fr-FR').format(budgetInfo.budget)} GNF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-700">Dépenses actuelles</span>
                <span className="font-medium">{new Intl.NumberFormat('fr-FR').format(budgetInfo.depenses)} GNF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-orange-700">Cette commande</span>
                <span className="font-medium">+{new Intl.NumberFormat('fr-FR').format(budgetInfo.nouvelle)} GNF</span>
              </div>
              <div className="flex justify-between border-t border-orange-300 pt-1 mt-1">
                <span className="text-orange-900 font-bold">Reste disponible</span>
                <span className="font-bold text-orange-900">{new Intl.NumberFormat('fr-FR').format(budgetInfo.reste)} GNF</span>
              </div>
            </div>
            {/* Barre de progression */}
            <div className="mt-3">
              <div className="w-full bg-orange-200 rounded-full h-2 overflow-hidden">
                <div className="h-2 bg-orange-500" style={{ width: `${Math.min(budgetInfo.pourcentage, 100)}%` }} />
              </div>
              <p className="text-xs text-orange-700 mt-1 text-right font-bold">{budgetInfo.pourcentage.toFixed(1)}% utilisé</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Budget OK
  return (
    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
      <div className="flex items-start space-x-3">
        <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-900">✅ Budget disponible</p>
          <p className="text-xs text-green-700 mt-1">
            Reste disponible : <strong>{new Intl.NumberFormat('fr-FR').format(budgetInfo.reste)} GNF</strong>
          </p>
          <div className="mt-2">
            <div className="w-full bg-green-200 rounded-full h-2 overflow-hidden">
              <div className="h-2 bg-green-500" style={{ width: `${Math.min(budgetInfo.pourcentage, 100)}%` }} />
            </div>
            <p className="text-xs text-green-700 mt-1 text-right">{budgetInfo.pourcentage.toFixed(1)}% utilisé</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetChecker;

