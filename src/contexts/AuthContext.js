import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Créer un utilisateur
  const signup = async (email, password, userData) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', user.uid), {
      ...userData,
      createdAt: new Date(),
      role: userData.role || 'service'
    });
    return user;
  };

  // Connexion
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Déconnexion
  const logout = () => {
    return signOut(auth);
  };

  // Charger le profil utilisateur
  const loadUserProfile = async (user) => {
    if (user) {
      // Vérifier si c'est l'email du DG avec accès complet
      if (user.email === 'dg@gmail.com') {
        setUserProfile({
          id: user.uid,
          email: user.email,
          nom: 'Directeur Général',
          prenom: 'DG',
          role: 'dg',
          poste: 'Directeur Général',
          permissions: 'all',
          isSuperAdmin: true,
          createdAt: new Date()
        });
        return;
      }
      
      // Vérifier les administrateurs créés localement
      const localAdmins = JSON.parse(localStorage.getItem('vitachAdmins') || '[]');
      const localAdmin = localAdmins.find(admin => admin.email === user.email);
      
      if (localAdmin) {
        // Forcer la configuration Super Admin pour tous les admins locaux
        const correctedProfile = {
          id: user.uid,
          ...localAdmin,
          role: 'dg', // Forcer le rôle DG pour l'accès complet
          isSuperAdmin: true,
          permissions: 'all'
        };
        setUserProfile(correctedProfile);
        return;
      }
      
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        setUserProfile({ id: user.uid, ...userDoc.data() });
      }
    } else {
      setUserProfile(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      await loadUserProfile(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    signup,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
