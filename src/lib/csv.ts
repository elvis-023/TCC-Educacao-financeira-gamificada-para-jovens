const campo = (valor: string | number) => {
  const texto = String(valor);
  return /[;"\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
};

/** CSV para o Excel em português: separador ";", UTF-8 com BOM e quebra de linha CRLF (RF12). */
export function gerarCsv(cabecalho: string[], linhas: (string | number)[][]): string {
  return `﻿${[cabecalho, ...linhas].map((l) => l.map(campo).join(';')).join('\r\n')}\r\n`;
}

export function baixarArquivo(nome: string, conteudo: string): void {
  const url = URL.createObjectURL(new Blob([conteudo], { type: 'text/csv;charset=utf-8' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: nome });
  link.click();
  URL.revokeObjectURL(url);
}
