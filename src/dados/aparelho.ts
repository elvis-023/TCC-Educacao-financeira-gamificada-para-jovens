export interface EstadoAparelho {
  sessaoUsuarioId: string | null;
  trilhasBaixadas: string[];
  deslocamentoRelogioMs: number;
  posTesteLiberadoDemo: boolean;
}

const CHAVE = 'efg:aparelho';
const PADRAO: EstadoAparelho = { sessaoUsuarioId: null, trilhasBaixadas: [], deslocamentoRelogioMs: 0, posTesteLiberadoDemo: false };
let estado: EstadoAparelho | null = null;
const ouvintes = new Set<() => void>();

export function lerAparelho(): EstadoAparelho {
  if (estado) return estado;
  try {
    const bruto = localStorage.getItem(CHAVE);
    estado = bruto ? { ...PADRAO, ...JSON.parse(bruto) } : { ...PADRAO };
  } catch {
    estado = { ...PADRAO };
  }
  return estado!;
}

export function atualizarAparelho(parcial: Partial<EstadoAparelho>): void {
  estado = { ...lerAparelho(), ...parcial };
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado));
  } catch {
    // sem armazenamento: fica em memória
  }
  ouvintes.forEach((ouvinte) => ouvinte());
}

export function assinarAparelho(ouvinte: () => void): () => void {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}
