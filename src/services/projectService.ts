import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc,
  orderBy
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Project } from '../types';

export async function saveProject(project: Omit<Project, 'id'>) {
  const path = 'projects';
  try {
    const docRef = await addDoc(collection(db, 'projects'), project);
    return docRef.id;
  } catch (e) {
    handleFirestoreError(e, OperationType.CREATE, path);
  }
}

export async function getUserProjects(uid: string): Promise<Project[]> {
  const path = 'projects';
  try {
    const q = query(
      collection(db, 'projects'), 
      where('uid', '==', uid),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Project));
  } catch (e) {
    handleFirestoreError(e, OperationType.LIST, path);
    return [];
  }
}

export async function deleteProject(id: string) {
  const path = `projects/${id}`;
  try {
    await deleteDoc(doc(db, 'projects', id));
  } catch (e) {
    handleFirestoreError(e, OperationType.DELETE, path);
  }
}

export async function updateProject(id: string, updates: Partial<Project>) {
  const path = `projects/${id}`;
  try {
    await updateDoc(doc(db, 'projects', id), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (e) {
    handleFirestoreError(e, OperationType.UPDATE, path);
  }
}
