export type DataAnalysisType = "Resumo" | "Rentabilidade" | "Ganho de Capital" | "Movimentação" | "Patrimônio" | "Distribuição";
export type DataInterval = "Do Início" | "No Ano" | "No Mês" | "3 Meses" | "6 Meses" | "12 Meses" | "24 Meses" | "36 Meses" | "Personalizado";
export type DataAggregator = "Dia" | "Mês" | "Ano" | "Total" | "Estratégia" | "Classe" | "Instituição";

export const dataAnalysisTypes: DataAnalysisType[] = ["Resumo", "Rentabilidade", "Ganho de Capital", "Movimentação", "Patrimônio", "Distribuição"];
export const dataIntervalOptions: DataInterval[] = ["Do Início", "No Ano", "No Mês", "3 Meses", "6 Meses", "12 Meses", "24 Meses", "36 Meses", "Personalizado"];
export const aggregatorOptions: DataAggregator[] = ["Dia", "Mês", "Ano", "Total", "Estratégia", "Classe", "Instituição"];
