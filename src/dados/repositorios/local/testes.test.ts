import { beforeEach, describe, expect, it } from 'vitest';
import { atualizarAparelho } from '@/dados/aparelho';
import { carregarBanco, reiniciarBanco } from '@/dados/bancoLocal';
import { ID_ALEX } from '@/dados/demo/usuarios';
import { sessaoLocal } from './sessao';
import { testesLocal } from './testes';

async function novaConta(email: string) {
  await sessaoLocal.cadastrar({ nome: 'Conta de Teste', email, senha: '12345678', tcleVersao: 'provisoria-1' });
}

describe('teste diagnóstico no modo local (RF05, RNF06)', () => {
  beforeEach(() => {
    reiniciarBanco();
    atualizarAparelho({ sessaoUsuarioId: null });
  });

  it('RF05: conta nova faz o pré-teste (Forma A, 3 perguntas, sem a correta) e o teste fica ligado ao pseudônimo', async () => {
    await novaConta('nova@exemplo.test');
    const aberto = await testesLocal.iniciar('pre');
    expect(aberto.resumo).toMatchObject({ tipoTeste: 'pre', forma: 'A', versao: '1.0', concluidoEm: null, respondidas: 0 });
    expect(aberto.perguntas.map((p) => p.id)).toEqual(['A-1', 'A-2', 'A-3']);
    expect(Object.keys(aberto.perguntas[0]).sort()).toEqual(['alternativas', 'enunciado', 'id', 'numero']);

    expect(await testesLocal.responder('pre', 'A-1', 0)).toEqual({ concluido: false });
    expect(await testesLocal.responder('pre', 'A-2', 3)).toEqual({ concluido: false });
    expect(await testesLocal.responder('pre', 'A-3', 1)).toEqual({ concluido: true });

    const banco = carregarBanco();
    const usuario = banco.usuarios.find((u) => u.email === 'nova@exemplo.test')!;
    const teste = banco.testes.find((t) => t.pseudonimo === banco.pseudonimos[usuario.id])!;
    expect(teste).toMatchObject({ tipoTeste: 'pre', forma: 'A', pontuacaoTotal: 2 }); // A-1 e A-3 corretas; "Não sei" na A-2
    expect(teste.concluidoEm).not.toBeNull();
    expect(JSON.stringify(teste)).not.toContain(usuario.nome);
    expect(JSON.stringify(teste)).not.toContain(usuario.email);
    const respostas = banco.respostasTeste.filter((r) => r.testeId === teste.id);
    expect(respostas).toHaveLength(3);
    expect(respostas.map((r) => r.acertou)).toEqual([true, false, true]);
    expect(respostas.every((r) => Boolean(r.respondidaEm))).toBe(true);
  });

  it('RF05: recarregar no meio retoma sem duplicar respostas', async () => {
    await novaConta('retoma@exemplo.test');
    await testesLocal.iniciar('pre');
    await testesLocal.responder('pre', 'A-1', 0);
    await testesLocal.responder('pre', 'A-1', 0); // mesma pergunta de novo
    const retomado = await testesLocal.iniciar('pre');
    expect(retomado.respondidas).toEqual(['A-1']);
    expect(retomado.resumo.respondidas).toBe(1);
  });

  it('RF05: o teste concluído não pode ser refeito', async () => {
    await novaConta('refaz@exemplo.test');
    await testesLocal.iniciar('pre');
    for (const [id, alt] of [['A-1', 0], ['A-2', 2], ['A-3', 1]] as const) await testesLocal.responder('pre', id, alt);
    await expect(testesLocal.responder('pre', 'A-1', 1)).rejects.toThrow('Teste já concluído');
  });

  it('RF05: pergunta de outra forma não pertence ao teste', async () => {
    await novaConta('forma@exemplo.test');
    await testesLocal.iniciar('pre');
    await expect(testesLocal.responder('pre', 'B-1', 0)).rejects.toThrow('Pergunta não pertence a este teste');
  });

  it('RF05: o pós-teste exige o pré-teste e as 4 trilhas; o jovem de demonstração com 1 trilha é barrado', async () => {
    atualizarAparelho({ sessaoUsuarioId: ID_ALEX });
    await expect(testesLocal.iniciar('pos')).rejects.toThrow('Conclua as 4 trilhas para liberar o teste final');
    await novaConta('sem-pre@exemplo.test');
    await expect(testesLocal.iniciar('pos')).rejects.toThrow('Faça o teste inicial primeiro');
  });

  it('a liberação de demonstração abre o pós-teste (Forma B)', async () => {
    atualizarAparelho({ sessaoUsuarioId: ID_ALEX, posTesteLiberadoDemo: true });
    const aberto = await testesLocal.iniciar('pos');
    expect(aberto.resumo).toMatchObject({ tipoTeste: 'pos', forma: 'B' });
    expect(aberto.perguntas.map((p) => p.id)).toEqual(['B-1', 'B-2', 'B-3']);
    atualizarAparelho({ posTesteLiberadoDemo: false });
  });
});
