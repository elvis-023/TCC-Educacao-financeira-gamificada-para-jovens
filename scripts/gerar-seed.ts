import { writeFileSync } from 'node:fs';
import { BADGES } from '../src/dados/demo/badges';
import { PARAMETROS_PADRAO } from '../src/dados/demo/parametros';
import { PERGUNTAS_DIAGNOSTICAS } from '../src/dados/demo/perguntasDiagnosticas';
import { QUESTOES_BASE, QUESTOES_NOVAS } from '../src/dados/demo/questoes';
import { LICOES, QUIZZES, TRILHAS } from '../src/dados/demo/trilhas';

const texto = (s: string) => `'${s.replace(/'/g, "''")}'`;
const lista = (itens: string[]) => `array[${itens.map(texto).join(', ')}]::text[]`;
const json = (valor: unknown) => `${texto(JSON.stringify(valor))}::jsonb`;

const sql: string[] = [
  '-- Gerado por scripts/gerar-seed.ts (npm run gerar:seed). Não editar à mão: mude src/dados/demo e gere de novo.',
  '-- Conteúdo inicial: trilhas, lições, quizzes, questões, conquistas, perguntas do teste e parâmetros padrão.',
  '-- Questões já existentes não são sobrescritas (o administrador pode tê-las editado).',
];

for (const t of TRILHAS) {
  sql.push(`insert into public.trilhas (id, slug, titulo, descricao, categoria, ordem) values (${texto(t.id)}, ${texto(t.slug)}, ${texto(t.titulo)}, ${texto(t.descricao)}, ${texto(t.categoria)}, ${t.ordem})
  on conflict (id) do update set slug = excluded.slug, titulo = excluded.titulo, descricao = excluded.descricao, categoria = excluded.categoria, ordem = excluded.ordem;`);
}
for (const l of LICOES) {
  sql.push(`insert into public.licoes (id, trilha_id, ordem, titulo, conteudo, tempo_leitura_min) values (${texto(l.id)}, ${texto(l.trilhaId)}, ${l.ordem}, ${texto(l.titulo)}, ${json(l.conteudo)}, ${l.tempoLeituraMin})
  on conflict (id) do update set titulo = excluded.titulo, conteudo = excluded.conteudo, tempo_leitura_min = excluded.tempo_leitura_min;`);
}
for (const q of QUIZZES) {
  sql.push(`insert into public.quizzes (id, licao_id, tipo_avaliacao, numero_questoes) values (${texto(q.id)}, ${texto(q.licaoId)}, ${texto(q.tipoAvaliacao)}, ${q.numeroQuestoes}) on conflict (id) do nothing;`);
}
for (const q of QUESTOES_BASE) {
  sql.push(`insert into public.questoes (id, quiz_id, enunciado, alternativas, resposta_correta, nivel_dificuldade, explicacao, ativa) values (${texto(q.id)}, ${texto(q.quizId)}, ${texto(q.enunciado)}, ${lista(q.alternativas)}, ${q.respostaCorreta}, ${texto(q.nivelDificuldade)}, ${texto(q.explicacao)}, ${q.ativa}) on conflict (id) do nothing;`);
}
for (const b of BADGES) {
  sql.push(`insert into public.badges (id, nome, descricao, criterio_marco, icone, ordem) values (${texto(b.id)}, ${texto(b.nome)}, ${texto(b.criterioMarco)}, ${texto(b.criterioMarco)}, ${texto(b.icone)}, ${b.ordem})
  on conflict (id) do update set nome = excluded.nome, descricao = excluded.descricao, criterio_marco = excluded.criterio_marco, icone = excluded.icone, ordem = excluded.ordem;`);
}
for (const p of PERGUNTAS_DIAGNOSTICAS) {
  sql.push(`insert into public.perguntas_diagnosticas (id, forma, versao, numero, enunciado, alternativas, alternativa_correta) values (${texto(p.id)}, ${texto(p.forma)}, ${texto(p.versao)}, ${p.numero}, ${texto(p.enunciado)}, ${lista(p.alternativas)}, ${p.alternativaCorreta})
  on conflict (id) do update set enunciado = excluded.enunciado, alternativas = excluded.alternativas, alternativa_correta = excluded.alternativa_correta;`);
}
const valores = Object.entries(PARAMETROS_PADRAO).map(([chave, valor]) => `(${texto(chave)}, ${valor})`).join(', ');
sql.push(`insert into public.parametros_sistema (chave, valor)
select x.chave, x.valor from (values ${valores}) as x(chave, valor)
where not exists (select 1 from public.parametros_sistema p where p.chave = x.chave);`);

writeFileSync('supabase/migrations/20261101120300_conteudo.sql', `${sql.join('\n')}\n`);
console.log(`SQL gerado: ${TRILHAS.length} trilhas, ${LICOES.length} lições, ${QUESTOES_BASE.length} questões.`);

// As 288 questões novas vão numa migração à parte: o projeto de desenvolvimento já recebeu a inicial.
const novas = [
  '-- Gerado por scripts/gerar-seed.ts (npm run gerar:seed). Não editar à mão: mude src/dados/demo/questoesNovas e gere de novo.',
  '-- Amplia o banco do quiz de 48 para 336 questões (28 por lição). Questões já existentes não são sobrescritas.',
  ...QUESTOES_NOVAS.map((q) => `insert into public.questoes (id, quiz_id, enunciado, alternativas, resposta_correta, nivel_dificuldade, explicacao, ativa) values (${texto(q.id)}, ${texto(q.quizId)}, ${texto(q.enunciado)}, ${lista(q.alternativas)}, ${q.respostaCorreta}, ${texto(q.nivelDificuldade)}, ${texto(q.explicacao)}, ${q.ativa}) on conflict (id) do nothing;`),
];
writeFileSync('supabase/migrations/20261101121200_questoes_novas.sql', `${novas.join('\n')}\n`);
console.log(`SQL das questões novas: ${QUESTOES_NOVAS.length} questões.`);
