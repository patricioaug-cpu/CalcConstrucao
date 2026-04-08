import { initializeApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
// @ts-ignore
import firebaseConfig from '../firebase-applet-config.json';

let app: any;
try {
  const maskedKey = firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 8)}...` : 'N/A';
  console.log("Inicializando Firebase:", { 
    projectId: firebaseConfig.projectId, 
    apiKey: maskedKey,
    authDomain: firebaseConfig.authDomain,
    origin: window.location.origin
  });
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Erro fatal ao inicializar Firebase:", error);
  app = { options: firebaseConfig } as any;
}

let db: any;
let auth: any;

try {
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  auth = getAuth(app);
  
  // Set persistence to local to improve session stability
  setPersistence(auth, browserLocalPersistence).catch(err => {
    console.warn("Não foi possível definir persistência local:", err);
  });
} catch (error) {
  console.error("Erro ao inicializar serviços do Firebase:", error);
}

export { db, auth };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map((provider: any) => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection to Firestore
async function testConnection() {
  try {
    console.log("Testando conexão com o Firebase...");
    // Attempt to fetch a non-existent doc to test connection
    await getDoc(doc(db, 'test', 'connection'));
    console.log("Conexão com Firestore estabelecida com sucesso.");
  } catch (error: any) {
    console.error("Falha na conexão com o Firebase:", error);
    if (error.message?.includes('the client is offline')) {
      console.error("DICA: O cliente está offline ou o domínio não está autorizado no Firebase Auth.");
    } else if (error.code === 'permission-denied') {
      console.error("DICA: Erro de permissão. Verifique as regras do Firestore.");
    } else if (error.code === 'unauthenticated') {
      console.log("Usuário não autenticado (esperado no início).");
    }
  }
}
testConnection();
