import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';
import { db } from '../firebase';
import { Logo } from './Logo';
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const trimmedEmail = email.trim();
      console.log("Iniciando tentativa de login para:", trimmedEmail);
      await loginUser(trimmedEmail, password);
      console.log("Login bem-sucedido, redirecionando...");
      navigate('/');
    } catch (err: any) {
      handleAuthError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = (err: any) => {
    console.error("Erro capturado no componente Login:", err);
    
    // Handle JSON error from handleFirestoreError
    if (err.message?.startsWith('{')) {
      try {
        const parsed = JSON.parse(err.message);
        setError(`Erro de Perfil: Não conseguimos carregar seus dados após o login. Verifique as regras do banco de dados. Detalhe: ${parsed.error}`);
        return;
      } catch (e) {
        // fallback
      }
    }

    if (err.code === 'auth/network-request-failed') {
      setError(`Erro de Rede: O aplicativo não conseguiu se comunicar com o Firebase. Verifique sua conexão.`);
    } else if (err.code === 'auth/invalid-credential') {
      setError('Credenciais Inválidas: O e-mail ou a senha estão incorretos. Verifique se digitou corretamente, sem espaços extras e respeitando maiúsculas/minúsculas. Se você esqueceu sua senha, use o link "Esqueceu a senha?".');
    } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
      setError('E-mail ou senha incorretos.');
    } else if (err.code === 'auth/invalid-email') {
      setError('E-mail inválido: O formato do e-mail digitado não é válido.');
    } else if (err.code === 'auth/user-disabled') {
      setError('Conta Desativada: Esta conta foi desativada por um administrador.');
    } else if (err.code === 'auth/operation-not-allowed') {
      setError('Serviço Desativado: Este método de login não está ativado no Firebase Console.');
    } else if (err.code === 'auth/too-many-requests') {
      setError('Muitas tentativas: Tente novamente mais tarde.');
    } else {
      setError(`Falha no Login: ${err.message || 'Erro desconhecido'}. (Código: ${err.code || 'N/A'})`);
    }
  };

  const clearAllData = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      // Firebase Auth uses indexedDB, clearing it can fix "stuck" sessions
      if (window.indexedDB && window.indexedDB.deleteDatabase) {
        window.indexedDB.deleteDatabase('firebaseLocalStorageDb');
      }
      window.location.reload();
    } catch (e) {
      window.location.reload();
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
                onClick={clearAllData}
                className="mt-2 text-emerald-600 hover:underline font-bold"
              >
                Limpar Tudo e Forçar Recarregamento
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
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
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

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${db ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
              Firebase: {db ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
          <div className="text-center text-slate-600">
            Não tem uma conta? <Link to="/register" className="text-emerald-600 font-semibold hover:underline">Cadastre-se</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
