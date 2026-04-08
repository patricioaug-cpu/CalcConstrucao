import { CalcInputs, CalcResults } from '../types';
import { 
  TRACES, 
  CEMENT_BAG_WEIGHT, 
  CEMENT_DENSITY
} from '../constants';

export function calculateMaterials(inputs: CalcInputs): CalcResults {
  const { service, width, heightOrLength, thickness, waste } = inputs;
  const area = width * heightOrLength;
  const wasteFactor = 1 + waste / 100;
  
  let results: Partial<CalcResults> = {
    area,
    thicknessM: thickness / 100,
    volumeTotal: area * (thickness / 100),
    volumeWithWaste: area * (thickness / 100) * wasteFactor,
    trace: 'N/A',
    sandM3: 0,
    cementBags: 0,
    totalCost: 0
  };

  if (service === 'reboco' || service === 'contrapiso' || service === 'alvenaria') {
    let { ratio, label: trace } = TRACES[service];
    
    // Override with custom ratio if provided
    if (inputs.useCustomRatio && inputs.customRatio && inputs.customRatio > 0) {
      ratio = inputs.customRatio;
      trace = `Personalizado (1:${ratio} Cimento : Areia)`;
    }

    const volumeWithWaste = area * (thickness / 100) * wasteFactor;
    // For mortars, the volume of sand is approximately the volume of the mortar.
    // We add a small yield factor (1.05) to account for compaction and voids.
    const sandM3 = volumeWithWaste * 1.05;
    const volumeCement = sandM3 / ratio;
    const weightCement = volumeCement * CEMENT_DENSITY;
    const cementBags = Math.ceil(weightCement / CEMENT_BAG_WEIGHT);
    
    results = {
      ...results,
      trace,
      sandM3,
      cementBags,
      volumeWithWaste
    };

    if (inputs.cementPrice) results.totalCost! += cementBags * inputs.cementPrice;
    if (inputs.sandPrice) results.totalCost! += sandM3 * inputs.sandPrice;

  }

  // Memória de cálculo
  let memory = `
Relatório de Cálculo - CalcConstrução
------------------------------------
Serviço: ${service.toUpperCase()}
Área Total: ${area.toFixed(2)} m²
Perda/Desperdício: ${waste}%
Traço/Tipo: ${results.trace}
------------------------------------
RESULTADOS:
`.trim();

  if (results.sandM3! > 0) memory += `\nAreia: ${results.sandM3!.toFixed(3)} m³`;
  if (results.cementBags! > 0) memory += `\nCimento: ${results.cementBags} sacos (50kg)`;

  if (results.totalCost! > 0) {
    memory += `\n------------------------------------`;
    memory += `\nCUSTO ESTIMADO: R$ ${results.totalCost!.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  }

  return {
    ...results,
    memory
  } as CalcResults;
}
