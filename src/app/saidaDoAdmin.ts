let intencional = false;

/** "Voltar ao app" troca a sessão para o jovem de demonstração: a guarda do administrador não deve avisar "Área restrita". */
export function marcarSaidaDoAdmin(): void {
  intencional = true;
}

export function consumirSaidaDoAdmin(): boolean {
  const valor = intencional;
  intencional = false;
  return valor;
}
