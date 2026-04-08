import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import { KeyRound, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await resetPassword(email);
      setSent(true);
    } catch (err: any) {
      if (err.code === 'auth/network-request-failed') {
        setError('Erro de conexão. Verifique sua internet ou se o domínio está autorizado no Firebase.');
      } else {
        setError(err.message || 'Erro ao enviar e-mail de recuperação.');
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-4">
            <KeyRound className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Recuperar senha</h1>
          <p className="text-slate-500">Enviaremos um link para você redefinir sua senha</p>
        </div>

        {sent ? (
          <div className="text-center py-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-4">
              <CheckCircle className="w-6 h-6" />
            </div>
            <p className="text-slate-700 mb-6">E-mail enviado com sucesso! Verifique sua caixa de entrada.</p>
            <Link to="/login" className="inline-flex items-center gap-2 text-emerald-600 font-semibold hover:underline">
              <ArrowLeft className="w-4 h-4" /> Voltar para o login
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
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

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link to="/login" className="inline-flex items-center gap-2 text-slate-600 hover:text-emerald-600 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Voltar para o login
              </Link>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};
