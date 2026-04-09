import React from 'react';
import { 
  HelpCircle, 
  BookOpen, 
  CheckCircle2, 
  Info, 
  Calculator, 
  AlertTriangle,
  ArrowRight,
  DollarSign,
  Settings2,
  FolderOpen,
  MapPin,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

export const Help: React.FC = () => {
  const navigate = useNavigate();
  const steps = [
    {
      title: "Escolha o Serviço",
      desc: "Selecione entre Reboco, Contrapiso ou Alvenaria. Cada serviço utiliza traços e cálculos específicos baseados em normas técnicas.",
      icon: <Calculator className="w-6 h-6 text-emerald-600" />
    },
    {
      title: "Informe as Dimensões",
      desc: "Insira a largura e altura (ou comprimento) da área em metros. Use o ponto (.) como separador decimal.",
      icon: <BookOpen className="w-6 h-6 text-emerald-600" />
    },
    {
      title: "Defina a Espessura",
      desc: "Informe a espessura da camada em centímetros (cm). O sistema sugere valores usuais para cada tipo de serviço.",
      icon: <Info className="w-6 h-6 text-emerald-600" />
    },
    {
      title: "Ajuste o Desperdício",
      desc: "O padrão é 10%, mas você pode ajustar conforme a realidade da sua obra e qualidade dos materiais.",
      icon: <AlertTriangle className="w-6 h-6 text-emerald-600" />
    },
    {
      title: "Cálculo de Custos",
      desc: "Insira os preços unitários dos materiais para obter um orçamento estimado instantâneo para o serviço selecionado.",
      icon: <DollarSign className="w-6 h-6 text-emerald-600" />
    },
    {
      title: "Traço Personalizado",
      desc: "Para reboco, contrapiso e alvenaria, você pode definir sua própria proporção de cimento e areia.",
      icon: <Settings2 className="w-6 h-6 text-emerald-600" />
    },
    {
      title: "Histórico de Projetos",
      desc: "Salve seus cálculos com nomes personalizados para consultar, editar ou excluir futuramente em seu perfil.",
      icon: <FolderOpen className="w-6 h-6 text-emerald-600" />
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Calculadora
      </button>

      <div className="text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-black text-slate-900 mb-4">Como utilizar o CalcConstrução?</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Siga os passos abaixo para obter orçamentos precisos de materiais para sua obra de forma rápida e profissional.
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((step, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 flex gap-4"
          >
            <div className="bg-emerald-50 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
              {step.icon}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{step.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-emerald-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-200 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl font-bold mb-4">Facilidades do Aplicativo</h2>
          <ul className="space-y-4">
            {[
              "Cálculo automático de sacos de cimento (50kg) e volume de areia (m³).",
              "Orçamento instantâneo com base nos preços de mercado fornecidos.",
              "Visualização 3D em tempo real para conferência de dimensões.",
              "Relatório detalhado pronto para compartilhar via WhatsApp.",
              "Histórico de Projetos: Salve e gerencie seus cálculos na nuvem.",
              "Traço Personalizado: Flexibilidade total para suas misturas."
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-300 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <HelpCircle className="absolute -right-8 -bottom-8 w-64 h-64 opacity-10" />
      </div>

      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-8">
        <div className="flex items-start gap-4">
          <Info className="w-8 h-8 text-emerald-600 flex-shrink-0" />
          <div>
            <h3 className="text-xl font-bold text-emerald-900 mb-2">Orientações de Uso</h3>
            <p className="text-emerald-800 leading-relaxed">
              Os cálculos fornecidos pelo CalcConstrução são baseados em médias técnicas e normas brasileiras (NBR). No entanto, variações na granulometria da areia, umidade e qualidade do cimento podem alterar os resultados reais.
              <br /><br />
              Utilize o aplicativo para agilizar seu planejamento e orçamentos, garantindo maior precisão na compra de materiais.
            </p>
          </div>
        </div>
      </div>

      <div className="text-center pb-12">
        <button 
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg hover:shadow-emerald-100"
        >
          Voltar ao Menu Principal <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
