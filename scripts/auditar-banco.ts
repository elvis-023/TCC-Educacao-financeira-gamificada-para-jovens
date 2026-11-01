import { QUESTOES_NOVAS, QUESTOES } from '../src/dados/demo/questoes';
import { normalizarTexto } from '../src/lib/texto';

// Auditoria do banco de questões (uso local): contagens por lição, repetidos e alternativa correta mais longa.
const porLicao: Record<string, Record<string, number>> = {};
for (const q of QUESTOES_NOVAS) {
  porLicao[q.quizId] ??= { facil: 0, medio: 0, dificil: 0 };
  porLicao[q.quizId][q.nivelDificuldade] += 1;
}
console.log('NOVAS por lição:', JSON.stringify(porLicao));

const vistos = new Map<string, string>();
for (const q of QUESTOES) {
  const chave = normalizarTexto(q.enunciado);
  if (vistos.has(chave)) console.log('ENUNCIADO REPETIDO:', vistos.get(chave), '=', q.id);
  vistos.set(chave, q.id);
}

const textuais = QUESTOES.filter((q) => !q.alternativas.every((a) => /^(R\$|[−-]?\d)/.test(a)));
const estritamenteMaior = (q: (typeof QUESTOES)[number]) => {
  const c = q.alternativas[q.respostaCorreta].length;
  return q.alternativas.every((a, i) => i === q.respostaCorreta || a.length < c);
};
const maiores = textuais.filter(estritamenteMaior);
console.log(`Textuais: ${textuais.length}; correta estritamente mais longa: ${maiores.length} (${Math.round((maiores.length / textuais.length) * 100)}%)`);
console.log(`Todas: correta estritamente mais longa em ${QUESTOES.filter(estritamenteMaior).length} de ${QUESTOES.length}`);
if (process.argv.includes('--listar')) for (const q of maiores) console.log(q.id);

// Desequilíbrio forte: a correta passa em 25% a maior das erradas (denuncia a resposta para quem "chuta pelo tamanho").
const fortes = textuais.filter((q) => {
  const c = q.alternativas[q.respostaCorreta].length;
  const maiorErrada = Math.max(...q.alternativas.filter((_, i) => i !== q.respostaCorreta).map((a) => a.length));
  return c > maiorErrada * 1.25;
});
console.log(`Correta >25% maior que a maior errada: ${fortes.length}`);
if (process.argv.includes('--fortes')) {
  for (const q of fortes) {
    const c = q.alternativas[q.respostaCorreta];
    console.log(`${q.id} | ${c.length} | ${q.alternativas.filter((_, i) => i !== q.respostaCorreta).map((a) => a.length).join('/')} | ${c.slice(0, 70)}`);
  }
}
