import { describe, expect, it } from 'vitest';
import { criarDadosDemo } from '@/dados/demo';
import { LICOES, TRILHAS } from '@/dados/demo/trilhas';
import { ID_ALEX } from '@/dados/demo/usuarios';
import { calcularProgressoTrilha, continuarDeOndeParei, estadoDaLicao, trilhasConcluidas } from './progresso';

const banco = criarDadosDemo(new Date('2026-11-04T15:00:00Z'));
const progressos = banco.progressos.filter((p) => p.usuarioId === ID_ALEX);
const respostas = banco.respostasQuiz.filter((r) => r.usuarioId === ID_ALEX);
const licoesDe = (trilhaId: string) => LICOES.filter((l) => l.trilhaId === trilhaId);

describe('progresso nas trilhas (RF02)', () => {
  it('status de cada trilha do jovem principal', () => {
    const status = TRILHAS.map((t) => calcularProgressoTrilha(t.id, progressos, respostas, 5));
    expect(status.map((s) => [s.trilhaId, s.status, s.licoesConcluidas])).toEqual([
      ['orcamento-pessoal', 'concluida', 3],
      ['juros-compostos', 'em_andamento', 1],
      ['cartao-de-credito', 'nao_iniciada', 0],
      ['inflacao-e-investimentos', 'nao_iniciada', 0],
    ]);
    expect(status[0].nivelAtual).toBe('medio');
  });
  it('a lição seguinte só abre depois do quiz da anterior', () => {
    const [l1, l2, l3] = licoesDe('juros-compostos');
    expect(estadoDaLicao(l1, licoesDe('juros-compostos'), progressos)).toBe('concluida');
    expect(estadoDaLicao(l2, licoesDe('juros-compostos'), progressos)).toBe('disponivel');
    expect(estadoDaLicao(l3, licoesDe('juros-compostos'), progressos)).toBe('bloqueada');
    expect(estadoDaLicao(licoesDe('cartao-de-credito')[0], licoesDe('cartao-de-credito'), progressos)).toBe('disponivel');
  });
  it('leitura feita sem quiz fica como quiz pendente', () => {
    const comLeitura = [...progressos, { ...progressos[0], id: 'x', licaoId: 'juros-compostos-2', trilhaId: 'juros-compostos', quizConcluidoEm: null }];
    expect(estadoDaLicao(licoesDe('juros-compostos')[1], licoesDe('juros-compostos'), comLeitura)).toBe('quiz_pendente');
  });
  it('continuar de onde parei: Juros Compostos, lição 2, ler', () => {
    const c = continuarDeOndeParei(TRILHAS, LICOES, progressos, respostas);
    expect(c).toMatchObject({ tipo: 'continuar', acao: 'ler' });
    expect(c.tipo === 'continuar' && c.licao.id).toBe('juros-compostos-2');
  });
  it('conta as trilhas concluídas', () => {
    expect(trilhasConcluidas(progressos)).toBe(1);
  });
});
