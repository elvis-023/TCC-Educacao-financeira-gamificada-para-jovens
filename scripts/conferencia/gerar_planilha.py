"""Monta a planilha de conferência (RNF01) com as fórmulas do Excel (FV e PMT) ao lado do resultado do app.

Ordem: gerar_casos.py -> npm run conferir:calculos -> gerar_planilha.py  ->  docs/conferencia/conferencia-calculos.xlsx
As colunas "Planilha" são fórmulas: o Excel as recalcula ao abrir. A coluna "Python" é o cálculo mês a mês, independente do app.
"""
import json
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter

pasta = Path(__file__).resolve().parents[2] / "docs" / "conferencia"
dados = json.loads((pasta / "resultados.json").read_text(encoding="utf-8"))
resumo = dados["resumo"]
negrito = Font(bold=True)
cabecalho = PatternFill("solid", fgColor="DCE6F8")
reais = '#,##0.00'


def cabecalhos(aba, titulos):
    for i, t in enumerate(titulos, 1):
        c = aba.cell(row=1, column=i, value=t)
        c.font, c.fill = negrito, cabecalho
        c.alignment = Alignment(wrap_text=True, vertical="top")
        aba.column_dimensions[get_column_letter(i)].width = 17
    aba.freeze_panes = "A2"


wb = Workbook()
leia = wb.active
leia.title = "Leia-me"
for linha in [
    ["Conferência dos simuladores (RNF01) — Educação Financeira Gamificada, Grupo 19"],
    [],
    ["Casos de juros compostos", resumo["casosJuros"]],
    ["Casos de fatura de cartão", resumo["casosFatura"]],
    ["Divergência máxima, juros compostos (R$, app × cálculo independente)", resumo["divergenciaMaximaJurosReais"]],
    ["Divergência máxima, fatura (R$, app × cálculo independente)", resumo["divergenciaMaximaFaturaReais"]],
    ["Casos com o teto de 100% aplicado de forma diferente", resumo["casosComTetoDiferente"]],
    [],
    ["Como ler"],
    ["Colunas 'Planilha' são fórmulas do Excel (FV e PMT) e recalculam ao abrir o arquivo."],
    ["Coluna 'Python' é o mesmo cálculo feito mês a mês, em Decimal de 50 dígitos, fora do código do app."],
    ["Coluna 'App' é o valor devolvido por simularJuros e simularFatura (src/regras/simuladores.ts)."],
    ["Taxa anual vira mensal por equivalência: i = (1 + a)^(1/12) − 1. Aporte no fim de cada mês. Sem Imposto de Renda e sem IOF (RN06)."],
    ["Cartão: rotativo só até a próxima fatura, depois tabela Price; soma das parcelas limitada a 2 × saldo (Lei 14.690/2023; Resolução CMN 5.112/2023)."],
    ["Os casos são gerados com semente fixa (scripts/conferencia/gerar_casos.py): qualquer pessoa reproduz os mesmos valores."],
]:
    leia.append(linha)
leia["A1"].font = Font(bold=True, size=13)
leia["A9"].font = negrito
leia.column_dimensions["A"].width = 95
leia.column_dimensions["B"].width = 14

aj = wb.create_sheet("Juros compostos")
cabecalhos(aj, ["Caso", "Valor inicial (R$)", "Aporte mensal (R$)", "Taxa (%)", "Unidade da taxa", "Prazo", "Unidade do prazo",
                "Taxa mensal", "Meses", "Montante — Planilha (FV)", "Montante — Python", "Montante — App", "App − Planilha (R$)", "|App − Python| (R$)"])
for n, c in enumerate(dados["juros"], 1):
    r = n + 1
    aj.append([n, c["valorInicial"], c["aporteMensal"], c["taxaPercentual"], c["unidadeTaxa"], c["prazo"], c["unidadePrazo"],
               f'=IF(E{r}="ano",(1+D{r}/100)^(1/12)-1,D{r}/100)', f'=IF(G{r}="anos",F{r}*12,F{r})',
               f"=FV(H{r},I{r},-C{r},-B{r})", float(c["esperado"]), c["app"], f"=L{r}-J{r}", f"=ABS(L{r}-K{r})"])
    for col in "BCJKLMN":
        aj[f"{col}{r}"].number_format = reais if col != "M" else "0.000000"
    aj[f"H{r}"].number_format = "0.000000%"
ultima = len(dados["juros"]) + 1
aj.cell(row=ultima + 2, column=12, value="Máximo |App − Python|").font = negrito
aj.cell(row=ultima + 2, column=14, value=f"=MAX(N2:N{ultima})").number_format = "0.000000"
aj.cell(row=ultima + 3, column=12, value="Máximo |App − Planilha|").font = negrito
aj.cell(row=ultima + 3, column=14, value=f"=MAX(MAX(M2:M{ultima}),-MIN(M2:M{ultima}))").number_format = "0.000000"

af = wb.create_sheet("Fatura de cartão")
cabecalhos(af, ["Caso", "Valor da fatura (R$)", "Pagamento mínimo (R$)", "Rotativo (% ao mês)", "Parcelamento (% ao mês)", "Parcelas",
                "Saldo (fatura − mínimo)", "Saldo parcelado (com rotativo)", "Parcela — Planilha (PMT, com teto)", "Parcela — Python", "Parcela — App",
                "Total pago — Planilha", "Total pago — App", "Teto de 100% aplicado (App)", "|App − Planilha| parcela", "|App − Planilha| total"])
for n, c in enumerate(dados["fatura"], 1):
    r = n + 1
    af.append([n, c["valorFatura"], c["pagamentoMinimo"], c["taxaRotativoPercentual"], c["taxaParcelamentoPercentual"], c["parcelas"],
               f"=B{r}-C{r}", f"=G{r}*(1+D{r}/100)",
               f"=IF(F{r}*PMT(E{r}/100,F{r},-H{r})-G{r}>G{r},2*G{r}/F{r},PMT(E{r}/100,F{r},-H{r}))", float(c["esperado"]["parcela"]), c["app"]["parcela"],
               f"=C{r}+F{r}*I{r}", c["app"]["totalPago"], "sim" if c["app"]["tetoAplicado"] else "não", f"=ABS(K{r}-I{r})", f"=ABS(M{r}-L{r})"])
    for col in "BCGHIJKLMOP":
        af[f"{col}{r}"].number_format = reais if col not in "OP" else "0.000000"
ultima = len(dados["fatura"]) + 1
af.cell(row=ultima + 2, column=14, value="Máximo").font = negrito
af.cell(row=ultima + 2, column=15, value=f"=MAX(O2:O{ultima})").number_format = "0.000000"
af.cell(row=ultima + 2, column=16, value=f"=MAX(P2:P{ultima})").number_format = "0.000000"

arquivo = pasta / "conferencia-calculos.xlsx"
wb.save(arquivo)
print("planilha:", arquivo)
