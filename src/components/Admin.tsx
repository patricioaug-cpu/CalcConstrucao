import React, { useEffect, useState } from 'react';
import { getAllUsers, getLoginHistory, updateUserStatus } from '../services/authService';
import { UserProfile, LoginLog } from '../types';
import { 
  Users, 
  History, 
  CheckCircle, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Search,
  Filter,
  RefreshCw
} from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const Admin: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [logins, setLogins] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'logins'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [u, l] = await Promise.all([getAllUsers(), getLoginHistory()]);
      setUsers(u);
      setLogins(l.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (err: any) {
      console.error(err);
      setError('Erro ao carregar dados. Verifique suas permissões de administrador.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (uid: string, status: UserProfile['status']) => {
    try {
      await updateUserStatus(uid, status);
      setUsers(users.map(u => u.uid === uid ? { ...u, status } : u));
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogins = logins.filter(l => 
    l.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    l.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-600" />
            Painel Administrativo
          </h1>
          <p className="text-slate-500">Gerencie usuários e acompanhe o histórico de acessos</p>
        </div>
        <button 
          onClick={fetchData}
          className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Dados
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-start gap-3 rounded-r-lg">
          <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="flex border-b border-slate-100">
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-4 px-6 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'users' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Users className="w-4 h-4" /> Usuários ({users.length})
          </button>
          <button 
            onClick={() => setActiveTab('logins')}
            className={`flex-1 py-4 px-6 font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              activeTab === 'logins' ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            }`}
          >
            <History className="w-4 h-4" /> Histórico de Logins ({logins.length})
          </button>
        </div>

        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : activeTab === 'users' ? (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Trial Até</th>
                  <th className="px-6 py-4">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(u => (
                  <tr key={u.uid} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{u.displayName}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        u.status === 'liberado' ? 'bg-green-100 text-green-700' : 
                        u.status === 'trial' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {u.status === 'liberado' && <CheckCircle className="w-3 h-3" />}
                        {u.status === 'trial' && <Clock className="w-3 h-3" />}
                        {u.status === 'bloqueado' && <XCircle className="w-3 h-3" />}
                        {u.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-700">{format(new Date(u.trialEndsAt), "dd/MM/yyyy", { locale: ptBR })}</div>
                      <div className="text-[10px] text-slate-500">
                        {u.role === 'admin' || u.status === 'liberado' 
                          ? 'Vitalício' 
                          : `${Math.max(0, Math.ceil((new Date(u.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} dias rest.`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleStatusChange(u.uid, 'liberado')}
                          className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                          title="Liberar Acesso"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleStatusChange(u.uid, 'bloqueado')}
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          title="Bloquear Acesso"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleStatusChange(u.uid, 'trial')}
                          className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                          title="Voltar para Trial"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold">
                <tr>
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">Data e Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogins.map((l, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{l.displayName}</div>
                      <div className="text-xs text-slate-500">{l.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {format(new Date(l.timestamp), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
