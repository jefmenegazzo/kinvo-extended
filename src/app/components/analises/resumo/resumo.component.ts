import { CommonModule } from "@angular/common";
import { Component, Input, OnChanges } from "@angular/core";
import { format } from "date-fns/format";
import { ptBR } from "date-fns/locale/pt-BR";
import { parse } from "date-fns/parse";
import { parseISO } from "date-fns/parseISO";
import { ButtonModule } from "primeng/button";
import { SkeletonModule } from "primeng/skeleton";
import { TableModule } from "primeng/table";
import { aggregationKeysFirst, aggregationKeysJurosCompostos, aggregationKeysLast, aggregationKeysPercentRelative, aggregationKeysSum, DataFull } from "../../../models/data-full";
import { DataAggregator } from "../analises.constants";

@Component({
	selector: "app-resumo",
	standalone: true,
	imports: [
		CommonModule,
		TableModule,
		ButtonModule,
		SkeletonModule,
	],
	templateUrl: "./resumo.component.html",
	styleUrl: "./resumo.component.scss"
})
export class ResumoComponent implements OnChanges {

	@Input()
	portfolioDataLoading: boolean = false;

	@Input()
	dataFullLoading: boolean = false;

	@Input()
	aggregatorOptionsSelected: DataAggregator | undefined;

	@Input()
	monthlyDataFiltered!: DataFull[];

	tableData: DataFull[] = [];
	tableDataTotalsRow: DataFull = {} as DataFull;

	ngOnChanges() {
		if (this.monthlyDataFiltered && this.aggregatorOptionsSelected) {
			this.buildViewResumo(this.monthlyDataFiltered);
		}
	}

	calcularJurosCompostos(percentuais: number[]): number {

		let percentualAcumulado = 1;

		for (const percentual of percentuais) {
			percentualAcumulado *= (1 + percentual);
		}

		return percentualAcumulado - 1;
	}

	createDataFull(date: string, dateFormat?: string): DataFull {

		return {
			referenceDate: dateFormat ? parse(date, dateFormat, new Date(), { locale: ptBR }) : parseISO(date),
			valueApplied: 0,
			initialEquity: 0,
			applications: 0,
			redemptions: 0,
			movementations: 0,
			returns: 0,
			proceeds: 0,
			capitalGain: 0,
			finalEquity: 0,
			incomeTax: 0,
			iof: 0,
			cost: 0,
			charges: 0,
			profitabilityCarteira: 0,
			profitabilityCdi: 0,
			profitabilityIbov: 0,
			profitabilityInflacao: 0,
			profitabilityPoupanca: 0,
			profitabilityCarteiraPercentCdi: 0,
			profitabilityCarteiraPercentIbov: 0,
			profitabilityCarteiraPercentInflacao: 0,
			profitabilityCarteiraPercentPoupanca: 0
		};
	}

	calcPercentOrNA(value: number, total: number): number | undefined {
		return value < 0 || total <= 0 ? undefined : value / total;
	}

	aggregateDataByAggregator(data: DataFull[], aggregator: DataAggregator) {

		const dataAggregated: Record<string, DataFull[]> = {};
		let dateFormat: string = "dd/MM/yyyy";
		data.sort((a, b) => a.referenceDate.getTime() - b.referenceDate.getTime());

		switch (aggregator) {
			case "Ano":
				dateFormat = "yyyy";
				break;
			case "Mês":
				dateFormat = "MM/yyyy";
				break;
			case "Dia":
				dateFormat = "dd/MM/yyyy";;
				break;
			case "Total":
				dateFormat = "";
				break;
		}

		for (const element of data) {

			const date = element.referenceDate;
			const key = dateFormat ? format(date, dateFormat, { locale: ptBR }) : "";

			if (!dataAggregated[key]) {
				dataAggregated[key] = [];
			}

			dataAggregated[key].push(element);
		}

		const dataFiltered = Object.entries(dataAggregated).map(([key, elements]) => {

			// Total
			if (!key) {
				key = new Date().toISOString();
			}

			const row = this.createDataFull(key, dateFormat);
			aggregationKeysFirst.forEach(key => row[key] = elements![0][key]);
			aggregationKeysLast.forEach(key => row[key] = elements![elements!.length - 1][key]);
			aggregationKeysSum.forEach(key => row[key] = elements!.reduce((acc, element) => acc + element[key]!, 0));
			aggregationKeysJurosCompostos.forEach(key => row[key] = this.calcularJurosCompostos(elements.map(element => element[key]!)));
			aggregationKeysPercentRelative.forEach((key, index) => row[key] = this.calcPercentOrNA(row.profitabilityCarteira, row[aggregationKeysJurosCompostos[index]]!));

			return row;
		});

		dataFiltered.sort((a, b) => b.referenceDate.getTime() - a.referenceDate.getTime());
		return dataFiltered;
	}

	buildViewResumo(monthlyDataFiltered: DataFull[]) {

		// Limpeza de Dados

		this.tableData = [];
		this.tableDataTotalsRow = {} as DataFull;

		this.tableData = [...monthlyDataFiltered];
		this.tableDataTotalsRow = this.aggregateDataByAggregator(this.tableData, "Total")?.[0];
	}

	downloadTableCSV() {

		const tableColumns: Record<keyof DataFull, string> = {
			referenceDate: "Data Referência",
			valueApplied: "Valor Investido",
			initialEquity: "Saldo Inicial",
			applications: "Aplicações",
			redemptions: "Resgates",
			movementations: "Movimentações",
			returns: "Rendimentos",
			proceeds: "Proventos",
			capitalGain: "Ganho de Capital",
			finalEquity: "Saldo Final",
			incomeTax: "IR",
			iof: "IOF",
			cost: "Taxas",
			charges: "Encargos",
			profitabilityCarteira: "Rentabilidade Carteira",
			profitabilityCdi: "Rentabilidade CDI",
			profitabilityIbov: "Rentabilidade IBOV",
			profitabilityInflacao: "Rentabilidade Inflação",
			profitabilityPoupanca: "Rentabilidade Poupança",
			profitabilityCarteiraPercentCdi: "Rentabilidade Carteira x CDI",
			profitabilityCarteiraPercentIbov: "Rentabilidade Carteira x IBOV",
			profitabilityCarteiraPercentInflacao: "Rentabilidade Carteira x Inflação",
			profitabilityCarteiraPercentPoupanca: "Rentabilidade Carteira x Poupança"
		};

		const csvHeader = Object.values(tableColumns).join(";") + "\n";

		const csvBody = this.tableData.map(
			row => Object.keys(tableColumns).map(
				column => {

					let value: undefined | string | number | Date = row[column as keyof DataFull];

					if (value instanceof Date) {
						value = format(value, this.aggregatorOptionsSelected == "Ano" ? "yyyy" : "MM/yyyy", { locale: ptBR });

					} else if (typeof value === "number") {
						value = value.toFixed(4).replace(",", "").replace(".", ",");
					}

					return value;

				}
			).join(";")
		).join("\n");

		const hiddenElement = document.createElement("a");
		hiddenElement.href = "data:text/csv;charset=utf-8," + encodeURI(csvHeader + csvBody);
		hiddenElement.target = "_blank";
		hiddenElement.download = "data.csv";
		hiddenElement.click();
	}
}
