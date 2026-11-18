import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';

/**
 * Suscripción en tiempo real a todos los reportes comunitarios
 * @param {Function} onUpdate - Callback al recibir datos
 * @param {Function} onError - Callback ante errores
 * @returns {Function} Unsubscribe listener
 */
export const subscribeToReports = (onUpdate, onError) => {
  return onSnapshot(
    collection(db, 'reportes'),
    (snapshot) => {
      const data = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          title: d.titulo,
          description: d.descripcion,
          image: d.imagenURL,
          comments: d.comentarios || [],
          user: d.nombreUsuario || 'Anónimo',
          direccion: d.direccion || 'Ubicación no disponible',
          etiquetas: d.etiquetas || [],
          estado: d.estado,
          creadoEn: d.creadoEn?.toDate() || null,
          ubicacion: d.ubicacion,
          colonia: d.colonia,
          userId: d.userId,
        };
      });
      onUpdate(data);
    },
    (error) => {
      if (onError) onError(error);
      else console.error('Error al suscribirse a reportes:', error);
    }
  );
};

/**
 * Suscripción en tiempo real a los reportes con estado 'pendiente' (Panel Admin)
 * @param {Function} onUpdate - Callback al recibir datos
 * @param {Function} onError - Callback ante errores
 * @returns {Function} Unsubscribe listener
 */
export const subscribeToPendingReports = (onUpdate, onError) => {
  const q = query(collection(db, 'reportes'), where('estado', '==', 'pendiente'));
  return onSnapshot(
    q,
    (snapshot) => {
      const datos = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      onUpdate(datos);
    },
    (error) => {
      if (onError) onError(error);
      else console.error('Error al suscribirse a reportes pendientes:', error);
    }
  );
};

/**
 * Suscripción en tiempo real a los reportes creados por un usuario específico
 * @param {string} userId - UID del usuario creador
 * @param {Function} onUpdate - Callback al recibir datos
 * @param {Function} onError - Callback ante errores
 * @returns {Function} Unsubscribe listener
 */
export const subscribeToUserReports = (userId, onUpdate, onError) => {
  if (!userId) {
    if (onUpdate) onUpdate([]);
    return () => {};
  }

  const q = query(collection(db, 'reportes'), where('userId', '==', userId));
  return onSnapshot(
    q,
    (snapshot) => {
      const data = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          title: d.titulo,
          description: d.descripcion,
          image: d.imagenURL,
          comments: d.comentarios || [],
          user: d.nombreUsuario || 'Anónimo',
          direccion: d.direccion || 'Ubicación no disponible',
          etiquetas: d.etiquetas || [],
          estado: d.estado,
          creadoEn: d.creadoEn?.toDate() || null,
          ubicacion: d.ubicacion,
          colonia: d.colonia,
          userId: d.userId,
        };
      });

      // Orden cronológico inverso (los más recientes primero)
      data.sort((a, b) => {
        const dateA = a.creadoEn ? a.creadoEn.getTime() : 0;
        const dateB = b.creadoEn ? b.creadoEn.getTime() : 0;
        return dateB - dateA;
      });

      onUpdate(data);
    },
    (error) => {
      if (onError) onError(error);
      else console.error('Error al suscribirse a reportes del usuario:', error);
    }
  );
};

/**
 * Crea un nuevo reporte en Firestore
 * @param {Object} reportData - Datos del reporte a guardar
 */
export const createReport = async (reportData) => {
  return await addDoc(collection(db, 'reportes'), {
    ...reportData,
    creadoEn: serverTimestamp(),
  });
};

/**
 * Actualiza el estado de un reporte (ej. 'resuelto', 'no_resuelto')
 * @param {string} reportId - ID del documento del reporte
 * @param {string} newStatus - Nuevo estado a asignar
 */
export const updateReportStatus = async (reportId, newStatus) => {
  const reporteRef = doc(db, 'reportes', reportId);
  return await updateDoc(reporteRef, {
    estado: newStatus,
    actualizadoEn: serverTimestamp(),
  });
};

/**
 * Elimina un reporte por su ID de Firestore
 * @param {string} reportId - ID del documento del reporte
 */
export const deleteReport = async (reportId) => {
  const reporteRef = doc(db, 'reportes', reportId);
  return await deleteDoc(reporteRef);
};
