import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { getUserProjects, deleteProject } from '../services/projectService';
import { Project } from '../types';
import { 
  FolderOpen, 
  Trash2, 
  Calendar, 
  ChevronRight, 
  AlertCircle,
  Search,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

export const Projects: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    setLoading(true);
    const data = await getUserProjects(user!.uid);
    setProjects(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    await deleteProject(id);
    setProjects(projects.filter(p => p.id !== id));
    setDeleteConfirmId(null);
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.results.trace.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto">
      <button 
        onClick={() => navigate('/')}
        className="mb-6 flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Calculadora
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <FolderOpen className="w-8 h-8 text-emerald-600" />
            Meus Projetos
          </h1>
          <p className="text-slate-500 mt-1">Gerencie seus cálculos salvos</p>
        </div>
        
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar projeto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-slate-500 mt-4">Carregando seus projetos...</p>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-12 text-center">
          <FolderOpen className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Nenhum projeto encontrado</h3>
          <p className="text-slate-500 mb-6">
            {searchTerm ? 'Tente uma busca diferente.' : 'Você ainda não salvou nenhum cálculo.'}
          </p>
          {!searchTerm && (
            <button 
              onClick={() => navigate('/')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-lg transition-all"
            >
              Fazer Primeiro Cálculo
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {filteredProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all group"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {project.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(project.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </div>
                    </div>
                    <div className="relative">
                      <button 
                        onClick={() => setDeleteConfirmId(project.id!)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Excluir Projeto"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>

                      <AnimatePresence>
                        {deleteConfirmId === project.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute right-0 top-full mt-2 z-20 bg-white shadow-xl border border-slate-100 rounded-xl p-4 w-48"
                          >
                            <p className="text-xs font-bold text-slate-900 mb-3">Excluir este projeto?</p>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setDeleteConfirmId(null)}
                                className="flex-1 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg"
                              >
                                Não
                              </button>
                              <button 
                                onClick={() => handleDelete(project.id!)}
                                className="flex-1 py-1.5 text-xs font-bold bg-red-500 text-white hover:bg-red-600 rounded-lg"
                              >
                                Sim
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Serviço:</span>
                      <span className="font-medium text-slate-700">{project.inputs.service.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Área:</span>
                      <span className="font-medium text-slate-700">{project.results.area.toFixed(2)} m²</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Traço:</span>
                      <span className="font-medium text-emerald-600">{project.results.trace}</span>
                    </div>
                    {project.results.totalCost! > 0 && (
                      <div className="flex justify-between text-sm pt-2 border-t border-slate-50">
                        <span className="text-slate-500">Custo Estimado:</span>
                        <span className="font-bold text-slate-900">
                          R$ {project.results.totalCost!.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => navigate('/', { state: { project } })}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 font-bold rounded-xl transition-all border border-slate-100 hover:border-emerald-200"
                  >
                    Abrir na Calculadora
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="mt-12 bg-emerald-50 rounded-2xl p-8 border border-emerald-100 flex flex-col md:flex-row items-center gap-6">
        <div className="bg-white p-4 rounded-full shadow-sm">
          <AlertCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <div>
          <h4 className="text-lg font-bold text-emerald-900">Dica de Profissional</h4>
          <p className="text-emerald-800 text-sm leading-relaxed">
            Mantenha seu histórico atualizado para facilitar orçamentos futuros. Você pode usar o botão "Abrir na Calculadora" para ajustar parâmetros de um projeto antigo e salvá-lo como um novo.
          </p>
        </div>
      </div>
    </div>
  );
};
