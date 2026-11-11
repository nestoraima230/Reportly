import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { ROLES } from '../constants/roles';
import { getUserProfile } from '../services/userService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        try {
          const profileData = await getUserProfile(firebaseUser.uid);
          if (profileData) {
            const rawRole = profileData.rol;
            const normalizedRole = rawRole === 'usuario' ? ROLES.USER : (rawRole || ROLES.USER);
            setUserRole(normalizedRole);
          } else {
            setUserRole(ROLES.USER);
          }
        } catch (error) {
          console.error('Error al obtener el rol:', error);
          setUserRole(ROLES.USER);
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
