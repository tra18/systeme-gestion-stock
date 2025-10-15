import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn, AlertCircle, Mail, Lock, User } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setErrorType(null);

    try {
      await login(email, password);
      toast.success('🎉 Connexion réussie ! Bienvenue dans VITACH GUINÉE');
      navigate('/dashboard');
    } catch (error) {
      console.error('Erreur de connexion:', error);
      
      // Messages d'erreur professionnels et conviviaux
      let errorMessage = '';
      let errorType = 'error';
      let icon = AlertCircle;
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = '🔍 Aucun compte trouvé avec cette adresse email';
          errorType = 'warning';
          icon = User;
          break;
        case 'auth/wrong-password':
          errorMessage = '🔒 Mot de passe incorrect. Veuillez vérifier votre saisie';
          errorType = 'error';
          icon = Lock;
          break;
        case 'auth/invalid-email':
          errorMessage = '📧 Adresse email invalide. Veuillez vérifier le format';
          errorType = 'warning';
          icon = Mail;
          break;
        case 'auth/user-disabled':
          errorMessage = '⚠️ Ce compte a été temporairement désactivé. Contactez votre administrateur';
          errorType = 'error';
          icon = AlertCircle;
          break;
        case 'auth/too-many-requests':
          errorMessage = '⏰ Trop de tentatives de connexion. Veuillez patienter quelques minutes avant de réessayer';
          errorType = 'warning';
          icon = AlertCircle;
          break;
        case 'auth/network-request-failed':
          errorMessage = '🌐 Problème de connexion internet. Vérifiez votre connexion et réessayez';
          errorType = 'error';
          icon = AlertCircle;
          break;
        case 'auth/weak-password':
          errorMessage = '🔐 Le mot de passe est trop faible. Utilisez au moins 6 caractères';
          errorType = 'warning';
          icon = Lock;
          break;
        case 'auth/email-already-in-use':
          errorMessage = '📧 Cette adresse email est déjà utilisée par un autre compte';
          errorType = 'warning';
          icon = Mail;
          break;
        case 'auth/invalid-login-credentials':
          errorMessage = '🔒 Identifiants de connexion invalides. Vérifiez votre email et mot de passe';
          errorType = 'error';
          icon = Lock;
          break;
        case 'auth/operation-not-allowed':
          errorMessage = '⚠️ Méthode de connexion non autorisée. Contactez votre administrateur';
          errorType = 'error';
          icon = AlertCircle;
          break;
        case 'auth/requires-recent-login':
          errorMessage = '🔄 Cette action nécessite une reconnexion récente. Veuillez vous reconnecter';
          errorType = 'warning';
          icon = AlertCircle;
          break;
        case 'auth/invalid-credential':
          errorMessage = '🔒 Credential invalide. Veuillez vérifier vos identifiants';
          errorType = 'error';
          icon = Lock;
          break;
        default:
          if (error.message) {
            errorMessage = `❌ ${error.message}`;
          } else {
            errorMessage = '❌ Une erreur inattendue s\'est produite. Veuillez réessayer';
          }
          errorType = 'error';
          icon = AlertCircle;
      }
      
      // Afficher l'erreur dans l'interface
      setError(errorMessage);
      setErrorType(errorType);
      
      // Afficher aussi un toast avec un message plus court
      const shortMessage = errorMessage.replace(/^[🔍🔒📧⚠️⏰🌐🔐❌]+\s*/, '');
      toast.error(shortMessage);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-20 w-64 sm:h-24 sm:w-72 flex items-center justify-center rounded-xl bg-white shadow-lg border-4 border-teal-200 overflow-hidden p-2 sm:p-3 logo-container">
            <img 
              src="/images/vitach-logo-compact.svg" 
              alt="Logo VITACH GUINÉE" 
              className="logo-image w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="logo-fallback hidden flex-col items-center justify-center">
              <span className="text-teal-600 font-bold text-2xl">VITACH</span>
              <span className="text-teal-600 font-semibold text-sm">GUINÉE</span>
            </div>
          </div>
          <p className="mt-4 text-center text-sm text-gray-600">
            Système de Gestion Intégré - Commandes, Maintenance & Ressources Humaines
          </p>
        </div>
        
        {/* Message d'erreur */}
        {error && (
          <div className={`rounded-lg p-4 border-l-4 ${
            errorType === 'error' 
              ? 'bg-red-50 border-red-400 text-red-700' 
              : 'bg-yellow-50 border-yellow-400 text-yellow-700'
          }`}>
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{error}</p>
                {errorType === 'error' && (
                  <p className="text-xs mt-1 text-red-600">
                    Si le problème persiste, contactez votre administrateur système.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Adresse email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4 mr-2" />
                  Se connecter à VITACH GUINÉE
                </>
              )}
            </button>
          </div>
        </form>
        
        {/* Section d'aide */}
        <div className="mt-8 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Besoin d'aide ?</h3>
            <div className="text-xs text-blue-600 space-y-1">
              <p>• Vérifiez que votre adresse email est correcte (ex: nom@vitach-guinee.com)</p>
              <p>• Assurez-vous que votre mot de passe est bien saisi (respectez les majuscules/minuscules)</p>
              <p>• Vérifiez que le compte existe dans le système VITACH GUINÉE</p>
              <p>• Contactez votre administrateur si vous avez oublié vos identifiants</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
