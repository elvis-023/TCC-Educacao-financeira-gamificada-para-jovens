"""Gera casos de conferência dos simuladores (RNF01) com cálculo independente do código do app.

Método independente: aplica mês a mês, em Decimal de 50 dígitos, o que a fórmula fechada do app resolve de uma vez.
Uso: python scripts/conferencia/gerar_casos.py  ->  docs/conferencia/casos.json
"""
import json
import random
from decimal import Decimal, getcontext
from pathlib import Path

getcontext().prec = 50
random.seed(2026)  # semente fixa: os mesmos casos em qualquer máquina


def d(x):
    return Decimal(str(x))


def juros(c, a, taxa_pct, unidade, prazo, unidade_prazo):
    i = d(taxa_pct) / 100
    if unidade == "ano":
        i = (1 + i) ** (Decimal(1) / 12) - 1  # equivalência, nunca a/12
    t = prazo if unidade_prazo == "meses" else prazo * 12
    saldo = d(c)
    for _ in range(t):  # aporte no fim de cada mês
        saldo = saldo * (1 + i) + d(a)
    return saldo


def fatura(f, m, r_pct, p_pct, n):
    saldo = d(f) - d(m)
    sp = saldo * (1 + d(r_pct) / 100)
    p = d(p_pct) / 100
    pmt = sp * p / (1 - (1 + p) ** (-n))
    teto = n * pmt - saldo > saldo
    if teto:
        pmt = 2 * saldo / n
    soma = n * pmt
    return {"parcela": pmt, "somaParcelas": soma, "juros": soma - saldo, "totalPago": d(m) + soma, "tetoAplicado": teto}


casos_juros = [dict(valorInicial=1000, aporteMensal=100, taxaPercentual=1, unidadeTaxa="mes", prazo=12, unidadePrazo="meses")]  # aceite fixo: R$ 2.395,08
casos_juros.append(dict(valorInicial=0, aporteMensal=200, taxaPercentual=0, unidadeTaxa="mes", prazo=24, unidadePrazo="meses"))  # taxa zero
casos_juros.append(dict(valorInicial=5000, aporteMensal=0, taxaPercentual=13.65, unidadeTaxa="ano", prazo=5, unidadePrazo="anos"))  # CDI de referência
while len(casos_juros) < 40:
    anual = random.random() < 0.5
    casos_juros.append(dict(
        valorInicial=random.choice([0, round(random.uniform(100, 50000), 2)]),
        aporteMensal=random.choice([0, round(random.uniform(10, 3000), 2)]),
        taxaPercentual=round(random.uniform(1, 18), 2) if anual else round(random.uniform(0.1, 3), 2),
        unidadeTaxa="ano" if anual else "mes",
        prazo=random.randint(1, 30) if anual else random.randint(1, 360),
        unidadePrazo="anos" if anual else "meses",
    ))
for c in casos_juros:
    c["esperado"] = str(juros(c["valorInicial"], c["aporteMensal"], c["taxaPercentual"], c["unidadeTaxa"], c["prazo"], c["unidadePrazo"]))

casos_fatura = []
while len(casos_fatura) < 40:
    f = round(random.uniform(300, 9000), 2)
    m = round(f * random.uniform(0.1, 0.5), 2)
    casos_fatura.append(dict(
        valorFatura=f, pagamentoMinimo=m,
        taxaRotativoPercentual=round(random.uniform(8, 16), 2),
        taxaParcelamentoPercentual=round(random.uniform(1.5, 9), 2),
        parcelas=random.randint(2, 24),
    ))
for c in casos_fatura:
    r = fatura(c["valorFatura"], c["pagamentoMinimo"], c["taxaRotativoPercentual"], c["taxaParcelamentoPercentual"], c["parcelas"])
    c["esperado"] = {k: (str(v) if k != "tetoAplicado" else v) for k, v in r.items()}

saida = Path(__file__).resolve().parents[2] / "docs" / "conferencia" / "casos.json"
saida.write_text(json.dumps({"juros": casos_juros, "fatura": casos_fatura}, indent=1), encoding="utf-8")
print(f"{len(casos_juros)} casos de juros e {len(casos_fatura)} de fatura em {saida}; teto aplicado em {sum(c['esperado']['tetoAplicado'] for c in casos_fatura)} faturas")
