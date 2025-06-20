import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebaseConfig'; // o desde firebaseConfig.js si ya lo tienes ahí
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { app } from '../config/firebaseConfig';

const db = getFirestore(app);

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // Obtener el rol desde Firestore
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', firebaseUser.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().rol || 'usuario');
          } else {
            setUserRole('usuario');
          }
        } catch (error) {
          console.error('Error al obtener el rol:', error);
          setUserRole('usuario');
        }

      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, userRole, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
