import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from './firebase';
import { UserProfile } from './types';
import { logout, createProfile } from './services/authService';
import { Calculator } from './components/Calculator';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Admin } from './components/Admin';
import { Help } from './components/Help';
import { Projects } from './components/Projects';
import { ForgotPassword } from './components/ForgotPassword';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Logo } from './components/Logo';
import { Menu, LogOut, Calculator as CalcIcon, Shield, HelpCircle, User, FolderOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, refreshUser: async () => {} });

export const useAuth = () => useContext(AuthContext);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
          <p className="text-slate-500 text-sm animate-pulse">Carregando seu perfil...</p>
          <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200 text-left max-w-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Status da Conexão</p>
            <p className="text-xs text-slate-600 mb-1">● Domínio: {window.location.hostname}</p>
            <p className="text-xs text-slate-600 mb-1">● Auth: {auth.currentUser ? 'Sessão Ativa' : 'Sem Sessão'}</p>
            <p className="text-xs text-slate-600">● Database: {db ? 'Inicializado' : 'Erro'}</p>
          </div>
          <p className="text-xs text-slate-400 max-w-xs mt-2">
            Se demorar muito, verifique sua conexão ou se o domínio está autorizado no Firebase.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-all"
          >
            Recarregar Aplicativo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {user && (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center gap-2 text-emerald-700 font-bold text-xl">
                  <Logo className="w-8 h-8" showText={false} />
                  <span>CalcConstrução</span>
                </Link>
              </div>
              
              <div className="hidden md:flex items-center space-x-4">
                <Link to="/" className="text-slate-600 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1">
                  <CalcIcon className="w-4 h-4" /> Calculadora
                </Link>
                <Link to="/projects" className="text-slate-600 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1">
                  <FolderOpen className="w-4 h-4" /> Meus Projetos
                </Link>
                <Link to="/help" className="text-slate-600 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1">
                  <HelpCircle className="w-4 h-4" /> Ajuda
                </Link>
                {user.role === 'admin' && (
                  <Link to="/admin" className="text-slate-600 hover:text-emerald-600 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1">
                    <Shield className="w-4 h-4" /> Admin
                  </Link>
                )}
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                  <span className="text-sm text-slate-500 flex items-center gap-1">
                    <User className="w-4 h-4" /> {user.displayName}
                  </span>
                  <button 
                    onClick={async () => { await logout(); navigate('/login'); }}
                    className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="md:hidden flex items-center">
                <button 
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-white border-t border-slate-100 overflow-hidden"
              >
                <div className="px-2 pt-2 pb-3 space-y-1">
                  <Link to="/" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-50">Calculadora</Link>
                  <Link to="/projects" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-50">Meus Projetos</Link>
                  <Link to="/help" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-50">Ajuda</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-50">Admin</Link>
                  )}
                  <button 
                    onClick={async () => { await logout(); navigate('/login'); setIsMenuOpen(false); }}
                    className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    Sair
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      )}
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-5xl">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="container mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} CalcConstrução. Todos os direitos reservados.</p>
          <p className="mt-1 text-xs text-slate-400 italic">
            CalcConstrução - Ferramenta de auxílio para construção civil.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    if (auth.currentUser) {
      const path = `users/${auth.currentUser.uid}`;
      try {
        const docRef = doc(db, 'users', auth.currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUser(docSnap.data() as UserProfile);
        }
      } catch (e) {
        handleFirestoreError(e, OperationType.GET, path);
      }
    }
  };

  useEffect(() => {
    // Safety timeout to prevent infinite loading if Firebase hangs
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn("Firebase Auth demorou demais para responder. Liberando interface...");
        setLoading(false);
      }
    }, 8000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("onAuthStateChanged disparado:", firebaseUser ? "Logado" : "Deslogado");
      
      try {
        if (firebaseUser) {
          try {
            const docRef = doc(db, 'users', firebaseUser.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              setUser(docSnap.data() as UserProfile);
            } else {
              console.log("Perfil não encontrado, criando novo...");
              const newProfile = await createProfile(firebaseUser, firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuário');
              setUser(newProfile);
            }
          } catch (error) {
            console.error("Erro ao carregar perfil no onAuthStateChanged:", error);
          }
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
        clearTimeout(timeoutId);
        console.log("Estado de carregamento finalizado.");
      }
    });

    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={{ user, loading, refreshUser }}>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
              <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/" element={user ? <Calculator /> : <Navigate to="/login" />} />
              <Route path="/projects" element={user ? <Projects /> : <Navigate to="/login" />} />
              <Route path="/admin" element={user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
              <Route path="/help" element={user ? <Help /> : <Navigate to="/login" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthContext.Provider>
    </ErrorBoundary>
  );
}
