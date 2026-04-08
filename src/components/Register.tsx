import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';
import { db } from '../firebase';
import { Logo } from './Logo';
import { UserPlus, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
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
      await registerUser(email, password, name);
      navigate('/');
    } catch (err: any) {
      console.error("Erro no registro:", err);
      if (err.code === 'auth/network-request-failed') {
        setError(`Erro de Rede: Não foi possível conectar ao Firebase. Verifique se o domínio "${window.location.hostname}" está autorizado.`);
      } else if (err.code === 'auth/email-already-in-use') {
        setError('E-mail em uso: Este e-mail já está cadastrado. Tente fazer login.');
      } else if (err.code === 'auth/weak-password') {
        setError('Senha fraca: A senha deve ter pelo menos 6 caracteres.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Serviço Desativado: O cadastro por e-mail não está ativado no Firebase.');
      } else {
        setError(`Falha no Cadastro: ${err.message || 'Erro desconhecido'}`);
      }
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
          <h1 className="text-2xl font-bold text-slate-900">Criar nova conta</h1>
          <p className="text-slate-500">Comece seu trial de 7 dias hoje mesmo</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="Seu nome"
              />
            </div>
          </div>

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
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Criando conta...' : 'Cadastrar'}
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
            Já tem uma conta? <Link to="/login" className="text-emerald-600 font-semibold hover:underline">Entrar</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
