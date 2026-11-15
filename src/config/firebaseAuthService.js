import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification
} from "firebase/auth";
import { auth } from "./firebaseConfig";

export const registerWithEmail = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    const user = userCredential.user;
    
    if (user && name) {
      await updateProfile(user, { displayName: name });
    }

    try {
      await sendEmailVerification(user);
    } catch (emailErr) {
      if (__DEV__) console.log('[auth/verify-email]', emailErr.code);
    }

    console.log(`✅ Registro exitoso: ${user.displayName || name} (${user.email})`);

    return userCredential;  
  } catch (error) {
    if (__DEV__) console.log('[auth/register]', error.code);
    throw error;  
  }
};

export const loginWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log(`✅ Inicio de sesión exitoso: ${user.displayName || "Usuario"} (${user.email})`);

    return user;
  } catch (error) {
      if (__DEV__) console.log('[auth/login]', error.code);
    throw error;
  }
};

export const logout = async () => {
  await signOut(auth);
};

export const resetPassword = async (email) => {
  await sendPasswordResetEmail(auth, email);
};

export const verifyEmail = async () => {
  const user = auth.currentUser;
  if (user) {
    await sendEmailVerification(user);
  }
};
