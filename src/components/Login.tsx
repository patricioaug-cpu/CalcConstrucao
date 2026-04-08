import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, loginWithGoogle } from '../services/authService';
import { Logo } from './Logo';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      console.log("Tentando login para:", email);
      await loginUser(email, password);
      console.log("Login bem-sucedido");
      navigate('/');
    } catch (err: any) {
      console.error("Erro detalhado no login:", err);
      
      // Handle JSON error from handleFirestoreError
      if (err.message?.startsWith('{')) {
        try {
          const parsed = JSON.parse(err.message);
          setError(`Erro no banco de dados (${parsed.operationType}): ${parsed.error}`);
          return;
        } catch (e) {
          // fallback
        }
      }

      if (err.code === 'auth/network-request-failed') {
        setError(`Erro de conexão. Verifique se o domínio "${window.location.hostname}" está autorizado no Firebase Console em Authentication > Settings > Authorized Domains.`);
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('E-mail ou senha incorretos. Verifique se você já criou uma conta ou se a senha está correta.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('O login por e-mail e senha não está ativado no Firebase Console. Vá em Authentication > Sign-in method e ative "Email/Password".');
      } else {
        setError(`Erro ao fazer login: ${err.message || 'Erro desconhecido'}. Código: ${err.code || 'sem código'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        // User closed the popup, don't show a scary error
        return;
      }
      console.error("Erro no login Google:", err);
      setError(`Erro no login com Google: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 mb-4">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Bem-vindo de volta</h1>
          <p className="text-slate-500">Acesse sua conta para continuar calculando</p>
        </div>

        {error && (
          <div className="mb-6 space-y-4">
            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-bold mb-1">Erro detectado:</p>
                <p>{error}</p>
              </div>
            </div>
            
            <div className="p-4 bg-slate-100 rounded-lg text-xs font-mono text-slate-600">
              <p className="font-bold mb-1">Diagnóstico do Sistema:</p>
              <p>Domínio Atual: {window.location.hostname}</p>
              <p>Protocolo: {window.location.protocol}</p>
              <p>User Agent: {navigator.userAgent.substring(0, 50)}...</p>
              <button 
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }}
                className="mt-2 text-emerald-600 hover:underline font-bold"
              >
                Limpar Cache e Recarregar App
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="seu@email.com"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700">Senha</label>
              <Link to="/forgot-password" className="text-sm text-emerald-600 hover:underline">Esqueceu a senha?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-slate-400 text-sm">ou</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          className="mt-6 w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 rounded-lg border border-slate-300 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Entrar com Google
        </button>

        <div className="mt-8 text-center text-slate-600">
          Não tem uma conta? <Link to="/register" className="text-emerald-600 font-semibold hover:underline">Cadastre-se</Link>
        </div>
      </motion.div>
    </div>
  );
};
