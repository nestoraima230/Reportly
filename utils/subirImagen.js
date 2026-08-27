import * as ImageManipulator from 'expo-image-manipulator';

export const subirImagen = async (uri) => {
  try {
    // 1. Comprimir imagen primero (HD pero liviana)
    const compressed = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 1080 } }],
      { compress: 0.4, format: ImageManipulator.SaveFormat.JPEG }
    );

    // 2. Preparar FormData para Cloudinary
    const data = new FormData();
    data.append('file', {
      uri: compressed.uri,
      type: 'image/jpeg',
      name: `upload_${Date.now()}.jpg`,
    });
    data.append('upload_preset', 'report');
    data.append('cloud_name', 'dcsa4u3cj');

    // 3. Subir a la API REST de Cloudinary
    const res = await fetch(
      'https://api.cloudinary.com/v1_1/dcsa4u3cj/image/upload',
      {
        method: 'POST',
        body: data,
      }
    );

    const result = await res.json();

    if (result.secure_url) {
      return result.secure_url;
    } else {
      throw new Error(result.error?.message || 'Error al subir imagen a Cloudinary');
    }
  } catch (error) {
    console.error('Error en subirImagen (Cloudinary):', error);
    throw error;
  }
};
