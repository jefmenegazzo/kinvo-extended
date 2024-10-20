import { CommonModule } from "@angular/common";
import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { format } from "date-fns/format";
import { ptBR } from "date-fns/locale/pt-BR";
import { ButtonModule } from "primeng/button";
import { SkeletonModule } from "primeng/skeleton";
import { TableModule } from "primeng/table";
import { AggregatedDataByDate } from "../../../models/aggregated-data-by-date";
import { DataAggregator } from "../analises.component";

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
	loading: boolean = false;

	@Input()
	aggregatedDataByDate: AggregatedDataByDate[] = [];

	@Input()
	aggregatedDataByDateTotals: AggregatedDataByDate = {} as AggregatedDataByDate;

	@Input()
	aggregatorOptionsSelected: DataAggregator | undefined;

	dateFormat: string = "dd/MM/yyyy";

	ngOnChanges(changes: SimpleChanges): void {

		if (changes["aggregatorOptionsSelected"]) {

			switch (this.aggregatorOptionsSelected) {
				case "Ano":
					this.dateFormat = "yyyy";
					break;
				case "Mês":
					this.dateFormat = "MM/yyyy";
					break;
				case "Dia":
					this.dateFormat = "dd/MM/yyyy";;
					break;
			}
		}
	}

	downloadCSV() {

		const tableColumns: Record<keyof AggregatedDataByDate, string> = {
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

		const csvBody = this.aggregatedDataByDate.map(
			row => Object.keys(tableColumns).map(
				column => {

					let value: undefined | string | number | Date = row[column as keyof AggregatedDataByDate];

					if (value instanceof Date) {
						value = format(value, this.dateFormat, { locale: ptBR });

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
