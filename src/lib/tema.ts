export type Tema = 'claro' | 'escuro';
const CHAVE = 'efg:tema';

export function lerTema(): Tema {
  try {
    return localStorage.getItem(CHAVE) === 'escuro' ? 'escuro' : 'claro';
  } catch {
    return 'claro';
  }
}

export function aplicarTema(tema: Tema): void {
  document.documentElement.classList.toggle('dark', tema === 'escuro');
}

export function definirTema(tema: Tema): void {
  try {
    localStorage.setItem(CHAVE, tema);
  } catch {
    // sem armazenamento: vale só até recarregar
  }
  aplicarTema(tema);
}
