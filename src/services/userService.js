import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { ROLES } from '../constants/roles';

/**
 * Obtiene el perfil de un usuario por su UID desde Firestore
 * @param {string} uid - Identificador del usuario
 * @returns {Promise<Object|null>} - Datos del perfil o null si no existe
 */
export const getUserProfile = async (uid) => {
  const userDocRef = doc(db, 'usuarios', uid);
  const docSnap = await getDoc(userDocRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
};

/**
 * Crea el perfil inicial de un usuario registrado en Firestore
 * @param {string} uid - Identificador del usuario
 * @param {Object} userData - Datos a inicializar
 */
export const createUserProfile = async (uid, userData) => {
  const userDocRef = doc(db, 'usuarios', uid);
  const profile = {
    username: userData.username || '',
    profileImage: userData.profileImage || '',
    rol: userData.rol || ROLES.USER,
    address: userData.address || '',
    posts: userData.posts || [],
    ...userData,
  };
  await setDoc(userDocRef, profile);
  return profile;
};

/**
 * Actualiza los campos del perfil de un usuario en Firestore
 * @param {string} uid - Identificador del usuario
 * @param {Object} updatedData - Campos a actualizar
 */
export const updateUserProfile = async (uid, updatedData) => {
  const userDocRef = doc(db, 'usuarios', uid);
  await updateDoc(userDocRef, updatedData);
};
