import { expect, it } from 'vitest';
import { gerarCsv } from './csv';

it('RF12: UTF-8 com BOM, ponto e vírgula, CRLF e aspas quando precisa', () => {
  const csv = gerarCsv(['a', 'b'], [['x;y', 'diz "oi"'], [1, 'Não sei']]);
  expect(csv.startsWith('﻿')).toBe(true);
  expect(csv).toBe('﻿a;b\r\n"x;y";"diz ""oi"""\r\n1;Não sei\r\n');
});
