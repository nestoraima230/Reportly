import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { app } from '../config/firebaseConfig';

const storage = getStorage(app);

export const subirImagen = async (uri) => {
  try {
    // En Expo, fetch puede manejar uri local para crear un blob
    const response = await fetch(uri);
    const blob = await response.blob();

    // Nombre único para evitar colisiones
    const filename = `reportes/${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);

    // Subir blob a Storage
    await uploadBytes(storageRef, blob);

    // Obtener URL pública para la imagen subida
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.log('Error subirImagen:', error);
    throw error;
  }
};
