import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../App';
import { checkTrialStatus } from '../services/authService';
import { calculateMaterials } from '../services/calcService';
import { saveProject, updateProject } from '../services/projectService';
import { CalcInputs, CalcResults, ServiceType, Project } from '../types';
import { Visualizer3D } from './Visualizer3D';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Calculator as CalcIcon, 
  Copy, 
  Check, 
  AlertTriangle, 
  Layers, 
  Maximize, 
  Settings2,
  Info,
  Clock,
  Share2,
  Save,
  MapPin,
  Plus,
  X,
  DollarSign,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Calculator: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [inputs, setInputs] = useState<CalcInputs>({
    service: 'reboco',
    width: 0,
    heightOrLength: 0,
    thickness: 0,
    waste: 10,
    cementPrice: 0,
    sandPrice: 0
  });
  const [results, setResults] = useState<CalcResults | null>(null);
  const [copied, setCopied] = useState(false);
  const [isTrialActive, setIsTrialActive] = useState(true);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [saving, setSaving] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      setIsTrialActive(checkTrialStatus(user));
    }
    
    // Load project if passed in state
    if (location.state?.project) {
      const p = location.state.project as Project;
      setInputs({
        ...p.inputs,
        useCustomRatio: p.inputs.useCustomRatio ?? !!p.inputs.customRatio
      });
      setResults(p.results);
      setProjectName(p.name);
      setCurrentProjectId(p.id || null);
    }
  }, [user, location.state]);

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isTrialActive) return;
    
    if (inputs.width > 0 && inputs.heightOrLength > 0 && inputs.thickness > 0) {
      const res = calculateMaterials(inputs);
      setResults(res);
      
      // Scroll to results after a short delay to allow rendering
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  };

  const handleCopy = () => {
    if (results) {
      navigator.clipboard.writeText(results.memory);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    if (results) {
      const text = encodeURIComponent(`*Cálculo CalcConstrução*\n\n${results.memory}`);
      window.open(`https://wa.me/?text=${text}`, '_blank');
    }
  };

  const handleSaveProject = async () => {
    if (!projectName.trim() || !results) return;
    setSaving(true);
    try {
      if (currentProjectId) {
        await updateProject(currentProjectId, {
          name: projectName,
          inputs,
          results
        });
      } else {
        const id = await saveProject({
          uid: user!.uid,
          name: projectName,
          inputs,
          results,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        if (id) setCurrentProjectId(id);
      }
      setIsSaveModalOpen(false);
      alert('Projeto salvo com sucesso!');
    } catch (e) {
      console.error(e);
      alert('Erro ao salvar projeto.');
    } finally {
      setSaving(false);
    }
  };

  const findNearbyStores = () => {
    window.open('https://www.google.com/maps/search/materiais+de+construção+perto+de+mim', '_blank');
  };

  if (!isTrialActive) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-2xl p-10 text-center border-t-8 border-red-500"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 text-red-600 mb-6">
            <Clock className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Período de Avaliação Encerrado</h2>
          <p className="text-lg text-slate-600 mb-8">
            Seu período de avaliação de 7 dias terminou. <br />
            Entre em contato pelo e-mail <span className="font-bold text-emerald-600">patricioaug@gmail.com</span> para continuar utilizando o CalcConstrução.
          </p>
          <a 
            href="mailto:patricioaug@gmail.com"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-emerald-200"
          >
            Entrar em Contato
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {currentProjectId && (
        <button 
          onClick={() => {
            setCurrentProjectId(null);
            setResults(null);
            setProjectName('');
            navigate('/', { state: {} });
          }}
          className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Novo Cálculo
        </button>
      )}

      {/* Trial Status Banner */}
      {user && (
        <div className={`p-3 rounded-xl flex items-center justify-between text-sm ${
          user.role === 'admin' || user.status === 'liberado' 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
            : 'bg-amber-50 text-amber-700 border border-amber-100'
        }`}>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="font-medium">
              {user.role === 'admin' || user.status === 'liberado' 
                ? 'Acesso Vitalício Liberado' 
                : `Período de Trial: ${Math.max(0, Math.ceil((new Date(user.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} dias restantes`}
            </span>
          </div>
          {user.role !== 'admin' && user.status !== 'liberado' && (
            <span className="text-xs opacity-70">
              Expira em: {new Date(user.trialEndsAt).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar Inputs */}
      <div className="lg:col-span-4 space-y-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-6 text-emerald-700">
            <Settings2 className="w-5 h-5" />
            <h2 className="font-bold text-lg">Parâmetros</h2>
          </div>

          <form className="space-y-5" onSubmit={handleCalculate}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Serviço</label>
              <div className="grid grid-cols-2 gap-2">
                {(['reboco', 'contrapiso', 'alvenaria'] as ServiceType[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setInputs({ ...inputs, service: s })}
                    className={`px-3 py-2 rounded-lg text-xs font-bold transition-all border ${
                      inputs.service === s 
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'
                    }`}
                  >
                    {s === 'reboco' ? 'Reboco' : 
                     s === 'contrapiso' ? 'Contrapiso' : 'Alvenaria'}
                  </button>
                ))}
              </div>
            </div>

            {(inputs.service === 'reboco' || inputs.service === 'contrapiso' || inputs.service === 'alvenaria') && (
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700">Traço Personalizado?</label>
                  <input 
                    type="checkbox" 
                    checked={!!inputs.useCustomRatio} 
                    onChange={(e) => setInputs({ ...inputs, useCustomRatio: e.target.checked, customRatio: e.target.checked ? (inputs.customRatio || 3) : undefined })}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                </div>
                {inputs.useCustomRatio && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600">1 :</span>
                    <input 
                      type="number" 
                      step="0.1"
                      value={inputs.customRatio === undefined ? '' : inputs.customRatio}
                      onChange={(e) => setInputs({ ...inputs, customRatio: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
                      className="w-full px-2 py-1 text-sm border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                      placeholder="Ex: 3"
                    />
                    <span className="text-xs text-slate-400 whitespace-nowrap">(Cim : Areia)</span>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {inputs.service === 'contrapiso' ? 'Largura (m)' : 'Largura (m)'}
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  value={inputs.width || ''}
                  onChange={(e) => setInputs({ ...inputs, width: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {inputs.service === 'contrapiso' ? 'Comprimento (m)' : 'Altura (m)'}
                </label>
                <input 
                  type="number" 
                  step="0.01"
                  value={inputs.heightOrLength || ''}
                  onChange={(e) => setInputs({ ...inputs, heightOrLength: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Espessura (cm)</label>
              <input 
                type="number" 
                step="0.1"
                value={inputs.thickness || ''}
                onChange={(e) => setInputs({ ...inputs, thickness: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                placeholder="Ex: 2.5"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                {inputs.service === 'reboco' ? 'Usual: 1.5 a 2.5 cm' : inputs.service === 'contrapiso' ? 'Usual: 3 a 7 cm' : 'Junta: 1 a 2 cm'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Desperdício (%)</label>
              <input 
                type="number" 
                value={inputs.waste}
                onChange={(e) => setInputs({ ...inputs, waste: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Cost Inputs Section */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Preços de Materiais (Opcional)
              </h3>
              <div className="space-y-3">
                {(inputs.service === 'reboco' || inputs.service === 'contrapiso' || inputs.service === 'alvenaria') && (
                  <>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">Cimento (Saco 50kg)</label>
                      <input 
                        type="number" 
                        value={inputs.cementPrice || ''}
                        onChange={(e) => setInputs({ ...inputs, cementPrice: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                        placeholder="R$ 0,00"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-1">Areia (m³)</label>
                      <input 
                        type="number" 
                        value={inputs.sandPrice || ''}
                        onChange={(e) => setInputs({ ...inputs, sandPrice: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                        placeholder="R$ 0,00"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-100"
            >
              <CalcIcon className="w-5 h-5" />
              Calcular Materiais
            </button>
          </form>
        </motion.div>

        <div className="space-y-3">
          <button 
            onClick={findNearbyStores}
            className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-3 px-4 rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <MapPin className="w-5 h-5 text-red-500" />
            Lojas de Materiais Próximas
          </button>
        </div>

        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100 flex gap-3">
          <Info className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-800 leading-relaxed">
            Os cálculos baseiam-se em traços normatizados. A densidade do cimento é considerada como 1440 kg/m³.
          </p>
        </div>
      </div>

      {/* Main Content / Results */}
      <div className="lg:col-span-8 space-y-6" ref={resultsRef}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100"
        >
          <Visualizer3D 
            service={inputs.service} 
            width={inputs.width} 
            heightOrLength={inputs.heightOrLength} 
            thickness={inputs.thickness} 
          />
          
          <div className="p-8">
            {!results ? (
              <div className="text-center py-12 text-slate-400">
                <CalcIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>Preencha os dados ao lado para ver o resultado</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Área Total</div>
                    <div className="text-2xl font-bold text-slate-900">{results.area.toFixed(2)} <span className="text-sm font-normal text-slate-500">m²</span></div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Volume Total</div>
                    <div className="text-2xl font-bold text-slate-900">{results.volumeWithWaste.toFixed(4)} <span className="text-sm font-normal text-slate-500">m³</span></div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <div className="text-slate-500 text-xs uppercase font-bold tracking-wider mb-1">Traço</div>
                    <div className="text-lg font-bold text-emerald-700">{results.trace}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-xl shadow-emerald-100 relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="text-emerald-100 text-xs uppercase font-bold tracking-wider mb-2">Quantidade de Areia</div>
                      <div className="text-4xl font-black">{results.sandM3.toFixed(3)} <span className="text-xl font-normal opacity-70">m³</span></div>
                    </div>
                    <Layers className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
                  </div>
                  <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-200 relative overflow-hidden">
                    <div className="relative z-10">
                      <div className="text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">Quantidade de Cimento</div>
                      <div className="text-4xl font-black">{results.cementBags} <span className="text-xl font-normal opacity-70">sacos</span></div>
                      <div className="text-xs text-slate-400 mt-1">Sacos de 50kg</div>
                    </div>
                    <Maximize className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 -rotate-12" />
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                      <Info className="w-5 h-5 text-emerald-600" />
                      Relatório Completo
                    </h3>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setIsSaveModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-all"
                      >
                        <Save className="w-4 h-4" />
                        Salvar
                      </button>
                      <button 
                        onClick={handleWhatsAppShare}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-green-500 text-white hover:bg-green-600 transition-all shadow-md"
                      >
                        <Share2 className="w-4 h-4" />
                        WhatsApp
                      </button>
                      <button 
                        onClick={handleCopy}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                          copied ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-6 font-mono text-sm text-slate-700 whitespace-pre-wrap border border-slate-200">
                    {results.memory}
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4 rounded-r-xl">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-800">
              <span className="font-bold">Informação:</span> Este aplicativo é uma ferramenta de auxílio. Consulte as normas vigentes (NBR) para especificações detalhadas e garanta a qualidade dos materiais utilizados.
            </p>
          </div>
        </div>
      </div>
    </div>

      {/* Save Project Modal */}
      <AnimatePresence>
        {isSaveModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-900">Salvar Projeto</h3>
                <button onClick={() => setIsSaveModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Projeto</label>
                  <input 
                    type="text" 
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Ex: Obra do Sr. João"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    autoFocus
                  />
                </div>
                <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-500 space-y-1">
                  <p><strong>Serviço:</strong> {inputs.service.toUpperCase()}</p>
                  <p><strong>Área:</strong> {results?.area.toFixed(2)} m²</p>
                  {results?.totalCost! > 0 && (
                    <p><strong>Custo:</strong> R$ {results?.totalCost!.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  )}
                </div>
              </div>
              <div className="p-6 bg-slate-50 flex gap-3">
                <button 
                  onClick={() => setIsSaveModalOpen(false)}
                  className="flex-1 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveProject}
                  disabled={saving || !projectName.trim()}
                  className="flex-1 py-2 font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? 'Salvando...' : 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
