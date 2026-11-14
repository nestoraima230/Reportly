/**
 * Traduce códigos de error de Firebase Auth a mensajes amigables en español.
 */
export const getAuthErrorMessage = (error) => {
  if (!error) return 'Ocurrió un error inesperado.';

  const code = error.code || '';

  switch (code) {
    case 'auth/invalid-email':
      return 'El formato del correo electrónico no es válido.';
    case 'auth/user-disabled':
      return 'Esta cuenta ha sido inhabilitada por un administrador.';
    case 'auth/user-not-found':
      return 'No existe ninguna cuenta registrada con este correo.';
    case 'auth/wrong-password':
      return 'La contraseña ingresada es incorrecta.';
    case 'auth/invalid-credential':
      return 'El correo o la contraseña son incorrectos.';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta registrada con este correo electrónico.';
    case 'auth/operation-not-allowed':
      return 'El inicio de sesión con correo y contraseña no está habilitado.';
    case 'auth/weak-password':
      return 'La contraseña es demasiado débil. Intenta con una combinación más segura.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Por tu seguridad, espera unos minutos o restablece tu contraseña.';
    case 'auth/network-request-failed':
      return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
    case 'auth/missing-password':
      return 'Por favor, ingresa tu contraseña.';
    default:
      return error.message || 'Ocurrió un error inesperado. Por favor, inténtalo nuevamente.';
  }
};
