import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  User
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  getDocFromServer,
  setDoc, 
  collection, 
  addDoc, 
  serverTimestamp,
  query,
  where,
  getDocs,
  updateDoc
} from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, LoginLog } from '../types';
import { ADMIN_EMAIL, TRIAL_DAYS } from '../constants';
import { addDays, isAfter } from 'date-fns';

export async function registerUser(email: string, pass: string, displayName: string) {
  try {
    console.log("Tentando registrar usuário:", email);
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const user = userCredential.user;
    console.log("Usuário criado no Auth, criando perfil...");
    return await createProfile(user, displayName);
  } catch (err: any) {
    console.warn("Erro no registro:", err.code, err.message);
    // If user already exists in Auth, try to sign in and check if profile exists
    if (err.code === 'auth/email-already-in-use') {
      try {
        console.log("E-mail já existe, tentando login automático...");
        const userCredential = await signInWithEmailAndPassword(auth, email, pass);
        const user = userCredential.user;
        console.log("Login automático bem-sucedido, verificando perfil...");
        const path = `users/${user.uid}`;
        let profileDoc;
        try {
          // Use getDocFromServer to bypass cache
          profileDoc = await getDocFromServer(doc(db, 'users', user.uid));
        } catch (e) {
          handleFirestoreError(e, OperationType.GET, path);
        }
        
        if (!profileDoc || !profileDoc.exists()) {
          // Profile missing, create it now
          return await createProfile(user, displayName);
        }
        
        // Profile exists, just return it (this will trigger navigation in the component)
        return profileDoc.data() as UserProfile;
      } catch (loginErr: any) {
        // If it's a Firestore error handled by handleFirestoreError, it will be rethrown as Error(JSON)
        // If it's an Auth error, we throw the original "email already in use"
        if (loginErr.message?.startsWith('{')) throw loginErr;
        throw err;
      }
    }
    throw err;
  }
}

export async function createProfile(user: User, displayName: string) {
  const trialEndsAt = addDays(new Date(), TRIAL_DAYS).toISOString();
  const isAdmin = user.email === ADMIN_EMAIL;
  
  const profile: UserProfile = {
    uid: user.uid,
    email: user.email!,
    displayName,
    role: isAdmin ? 'admin' : 'user',
    status: isAdmin ? 'liberado' : 'trial',
    createdAt: new Date().toISOString(),
    trialEndsAt
  };
  
  const path = `users/${user.uid}`;
  try {
    await setDoc(doc(db, 'users', user.uid), profile);
  } catch (e) {
    handleFirestoreError(e, OperationType.WRITE, path);
  }
  return profile;
}

export async function loginUser(email: string, pass: string) {
  console.log("Iniciando loginUser para:", email);
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  const user = userCredential.user;
  console.log("Login no Auth bem-sucedido para UID:", user.uid);
  
  // Log the login
  const loginLog: LoginLog = {
    uid: user.uid,
    email: user.email!,
    displayName: user.displayName || user.email?.split('@')[0] || 'Usuário',
    timestamp: new Date().toISOString()
  };
  
  const logPath = 'logins';
  try {
    console.log("Registrando log de acesso...");
    await addDoc(collection(db, 'logins'), loginLog);
  } catch (e) {
    console.error("Erro ao registrar log de login:", e);
    // Don't block login if logging fails, but log it
  }
  
  // Fetch profile
  const profilePath = `users/${user.uid}`;
  let profileDoc;
  try {
    console.log("Buscando perfil do usuário (do servidor)...");
    // Use getDocFromServer to bypass cache
    profileDoc = await getDocFromServer(doc(db, 'users', user.uid));
  } catch (e) {
    handleFirestoreError(e, OperationType.GET, profilePath);
  }

  if (!profileDoc || !profileDoc.exists()) {
    console.log("Perfil não encontrado, criando perfil padrão...");
    // If profile is missing, create a default one to avoid getting stuck
    return await createProfile(user, user.email?.split('@')[0] || 'Usuário');
  }
  
  console.log("Perfil carregado com sucesso");
  return profileDoc.data() as UserProfile;
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function logout() {
  await signOut(auth);
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  const userCredential = await signInWithPopup(auth, provider);
  const user = userCredential.user;
  
  // Fetch or create profile
  const profileDoc = await getDoc(doc(db, 'users', user.uid));
  if (!profileDoc.exists()) {
    return await createProfile(user, user.displayName || user.email?.split('@')[0] || 'Usuário');
  }
  return profileDoc.data() as UserProfile;
}

export function checkTrialStatus(profile: UserProfile): boolean {
  if (profile.role === 'admin' || profile.status === 'liberado') return true;
  if (profile.status === 'bloqueado') return false;
  
  const now = new Date();
  const trialEnd = new Date(profile.trialEndsAt);
  
  return isAfter(trialEnd, now);
}

export async function getAllUsers(): Promise<UserProfile[]> {
  const path = 'users';
  try {
    const q = query(collection(db, 'users'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as UserProfile);
  } catch (e) {
    handleFirestoreError(e, OperationType.LIST, path);
    return [];
  }
}

export async function updateUserStatus(uid: string, status: UserProfile['status']) {
  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), { status });
  } catch (e) {
    handleFirestoreError(e, OperationType.UPDATE, path);
  }
}

export async function getLoginHistory(): Promise<LoginLog[]> {
  const path = 'logins';
  try {
    const q = query(collection(db, 'logins'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as LoginLog);
  } catch (e) {
    handleFirestoreError(e, OperationType.LIST, path);
    return [];
  }
}
