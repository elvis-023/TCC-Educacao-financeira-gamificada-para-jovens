import type { Usuario } from '@/dados/tipos';
import { diaNoFuso, instanteRelativo } from '@/lib/fuso';

export const ID_ALEX = 'demo-alex';
export const ID_ADMIN = 'demo-admin';
export const TCLE_VERSAO = 'provisoria-1';

interface JovemFicticio { id: string; nome: string; email: string; xpTotal: number; xpSemana: number; diasAtrasCadastro: number; pseudonimo: string }

export const JOVENS_FICTICIOS: JovemFicticio[] = [
  { id: 'demo-bruna', nome: 'Bruna Moreira', email: 'bruna.moreira@exemplo.test', xpTotal: 940, xpSemana: 85, diasAtrasCadastro: 20, pseudonimo: 'P-1B2D' },
  { id: 'demo-caio', nome: 'Caio Ribeiro', email: 'caio.ribeiro@exemplo.test', xpTotal: 760, xpSemana: 140, diasAtrasCadastro: 19, pseudonimo: 'P-A41C' },
  { id: 'demo-duda', nome: 'Duda Farias', email: 'duda.farias@exemplo.test', xpTotal: 590, xpSemana: 20, diasAtrasCadastro: 18, pseudonimo: 'P-5E7B' },
  { id: 'demo-enzo', nome: 'Enzo Tavares', email: 'enzo.tavares@exemplo.test', xpTotal: 430, xpSemana: 0, diasAtrasCadastro: 17, pseudonimo: 'P-92F0' },
  { id: 'demo-gabi', nome: 'Gabi Lopes', email: 'gabi.lopes@exemplo.test', xpTotal: 265, xpSemana: 45, diasAtrasCadastro: 16, pseudonimo: 'P-C3D8' },
  { id: 'demo-heitor', nome: 'Heitor Santana', email: 'heitor.santana@exemplo.test', xpTotal: 124, xpSemana: 60, diasAtrasCadastro: 12, pseudonimo: 'P-0A6E' },
  { id: 'demo-iara', nome: 'Iara Nogueira', email: 'iara.nogueira@exemplo.test', xpTotal: 105, xpSemana: 35, diasAtrasCadastro: 11, pseudonimo: 'P-E15B' },
  { id: 'demo-joao', nome: 'João Pires', email: 'joao.pires@exemplo.test', xpTotal: 80, xpSemana: 0, diasAtrasCadastro: 10, pseudonimo: 'P-4D9A' },
  { id: 'demo-kaua', nome: 'Kauã Vasconcelos', email: 'kaua.vasconcelos@exemplo.test', xpTotal: 55, xpSemana: 25, diasAtrasCadastro: 9, pseudonimo: 'P-B8C2' },
  { id: 'demo-lara', nome: 'Lara Campos', email: 'lara.campos@exemplo.test', xpTotal: 30, xpSemana: 30, diasAtrasCadastro: 8, pseudonimo: 'P-6F01' },
  { id: 'demo-mateus', nome: 'Mateus Barros', email: 'mateus.barros@exemplo.test', xpTotal: 10, xpSemana: 10, diasAtrasCadastro: 7, pseudonimo: 'P-7F3A' },
];
export const PSEUDONIMO_ALEX = 'P-3C9E';

export function criarUsuarios(agora: Date): Usuario[] {
  const ultimaAtividade = instanteRelativo(agora, 1, 20, 0);
  const cadastroAlex = instanteRelativo(agora, 5, 19, 0);
  const alex: Usuario = {
    id: ID_ALEX, nome: 'Alex Lima', email: 'alex.lima@exemplo.test', papel: 'jovem', xpTotal: 120, diasStreak: 4,
    ultimoDiaUso: diaNoFuso(ultimaAtividade), ultimaAtividadeEm: ultimaAtividade, receberLembretes: true,
    tcleVersao: TCLE_VERSAO, tcleAceitoEm: cadastroAlex, privacidadeAceitaEm: cadastroAlex, maioridadeDeclaradaEm: cadastroAlex, criadoEm: cadastroAlex,
  };
  const admin: Usuario = {
    id: ID_ADMIN, nome: 'Admin Demonstração', email: 'admin@exemplo.test', papel: 'admin', xpTotal: 0, diasStreak: 0,
    ultimoDiaUso: null, ultimaAtividadeEm: null, receberLembretes: false, tcleVersao: null, tcleAceitoEm: null,
    privacidadeAceitaEm: null, maioridadeDeclaradaEm: null, criadoEm: instanteRelativo(agora, 30, 9, 0),
  };
  const outros: Usuario[] = JOVENS_FICTICIOS.map((j) => {
    const cadastro = instanteRelativo(agora, j.diasAtrasCadastro, 18, 0);
    return {
      id: j.id, nome: j.nome, email: j.email, papel: 'jovem', xpTotal: j.xpTotal, diasStreak: 0, ultimoDiaUso: null,
      ultimaAtividadeEm: null, receberLembretes: true, tcleVersao: TCLE_VERSAO, tcleAceitoEm: cadastro,
      privacidadeAceitaEm: cadastro, maioridadeDeclaradaEm: cadastro, criadoEm: cadastro, xpSemanaFicticio: j.xpSemana,
    };
  });
  return [alex, admin, ...outros];
}
