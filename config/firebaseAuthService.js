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
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  if (user && name) {
    await updateProfile(user, { displayName: name });
  }

  console.log(`✅ Registro exitoso: ${user.displayName || name} (${user.email})`);

  return user;
};

export const loginWithEmail = async (email, password) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  console.log(`✅ Inicio de sesión exitoso: ${user.displayName || "Usuario"} (${user.email})`);

  return user;
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