import { CommonModule, CurrencyPipe } from "@angular/common";
import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { ChartData, ChartDataset, ChartOptions, ChartType, Plugin } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { format } from "date-fns/format";
import { ptBR } from "date-fns/locale/pt-BR";
import { ChartModule } from "primeng/chart";
import { AggregatedDataByDate } from "../../../models/aggregated-data-by-date";
import { DataAggregator } from "../analises.component";

@Component({
	selector: "app-patrimonio",
	standalone: true,
	imports: [
		CommonModule,
		ChartModule
	],
	providers: [
		CurrencyPipe
	],
	templateUrl: "./patrimonio.component.html",
	styleUrl: "./patrimonio.component.scss"
})
export class PatrimonioComponent implements OnChanges {

	@Input()
	loading: boolean = false;

	@Input()
	aggregatedDataByDate: AggregatedDataByDate[] = [];

	@Input()
	aggregatorOptionsSelected: DataAggregator | undefined;

	dateFormat: string = "dd/MM/yyyy";

	chartType: ChartType | undefined;
	chartData: ChartData | undefined;
	chartOptions: ChartOptions | undefined;
	chartPlugins: Plugin[] = [];
	chartHeight: string = "100%";

	constructor(
		private currencyPipe: CurrencyPipe
	) { }

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

		if (changes["aggregatedDataByDate"]) {
			this.buildChart();
		}
	}

	buildChart() {

		this.chartType = undefined;
		this.chartData = undefined;
		this.chartOptions = undefined;
		this.chartPlugins.splice(0, this.chartPlugins.length);
		this.chartHeight = "100%";

		if (this.aggregatedDataByDate.length === 0) {
			return;
		}

		if (this.aggregatorOptionsSelected == "Ano") {

			if (!this.chartPlugins.includes(ChartDataLabels)) {
				this.chartPlugins.push(ChartDataLabels);
			}

			this.chartType = "bar";
			this.chartHeight = 75 + (20 * this.aggregatedDataByDate.length) + "px";

			this.aggregatedDataByDate = [...this.aggregatedDataByDate].sort((a, b) => b.referenceDate.getTime() - a.referenceDate.getTime());

			this.chartData = {
				labels: this.aggregatedDataByDate.map(element => format(element.referenceDate, this.dateFormat, { locale: ptBR })),
				datasets: (["valueApplied", "finalEquity"] as (keyof Pick<AggregatedDataByDate, "valueApplied" | "finalEquity">)[]).map(serie => {

					const result: ChartDataset = {
						type: "bar",
						label: "",
						data: this.aggregatedDataByDate.map(element => element[serie]),
						borderWidth: 1,
						borderColor: "",
						backgroundColor: "",
						datalabels: {
							align: "start",
							font: {
								family: "Montserrat",
								weight: 700,
								size: 10
							}
						}
					};

					switch (serie) {
						case "valueApplied":
							result.label = "Valor Investido";
							result.borderColor = "#2196F3";
							result.backgroundColor = "#2196F3";
							result.datalabels!.align = "start";
							break;

						case "finalEquity":
							result.label = "Saldo Bruto";
							result.borderColor = "#673AB7";
							result.backgroundColor = "#673AB7";
							result.datalabels!.align = "end";
							break;
					}

					return result;
				})
			};

			this.chartOptions = {
				locale: "pt-BR",
				indexAxis: "y",
				interaction: {
					mode: "index",
					axis: "y"
				},
				responsive: true,
				// maintainAspectRatio: true,
				// aspectRatio: 1.5,
				maintainAspectRatio: false,
				aspectRatio: 1,
				plugins: {
					tooltip: {
						mode: "index",
						intersect: false,
						callbacks: {
							label: (context) => {
								const label = context.dataset.label || "";
								const value = context.parsed.x || 0;
								return `${label}: ${this.currencyPipe.transform(value, "BRL", "symbol", "1.2-2")}`;
							}
						}
					},
					legend: {
						position: "top"
					},
					datalabels: {
						anchor: "end",
						display: true,
						formatter: (value, context) => {
							return `${this.currencyPipe.transform(value, "BRL", "symbol", "1.2-2")}`;
						}
					}
				},
				scales: {
					x: {
						stacked: false,
						beginAtZero: true,
						ticks: {
							callback: (value, index, ticks) => {
								return `${this.currencyPipe.transform(value, "BRL", "symbol", "1.2-2")}`;
							},
						}
					},
					y: {
						stacked: true
					}
				}
			};

		} else {

			this.chartType = "line";
			this.chartHeight = window.innerWidth < window.innerHeight ? "50%" : "100%";

			this.aggregatedDataByDate = [...this.aggregatedDataByDate].sort((a, b) => a.referenceDate.getTime() - b.referenceDate.getTime());

			this.chartData = {
				labels: this.aggregatedDataByDate.map(element => format(element.referenceDate, this.dateFormat, { locale: ptBR })),
				datasets: (["valueApplied", "finalEquity"] as (keyof Pick<AggregatedDataByDate, "valueApplied" | "finalEquity">)[]).map(serie => {

					const result: ChartDataset = {
						type: "line",
						label: "",
						data: this.aggregatedDataByDate.map(element => element[serie]),
						borderWidth: 1,
						borderColor: "",
						backgroundColor: "",
						fill: true,
						pointStyle: false
					};

					switch (serie) {
						case "valueApplied":
							result.label = "Valor Investido";
							result.borderColor = "#2196F3";
							result.backgroundColor = "#2196F3";
							break;

						case "finalEquity":
							result.label = "Saldo Bruto";
							result.borderColor = "#673AB7";
							result.backgroundColor = "#673AB7";
							break;
					}

					return result;
				})
			};

			this.chartOptions = {
				locale: "pt-BR",
				indexAxis: "x",
				interaction: {
					mode: "index",
					axis: "x"
				},
				responsive: true,
				// maintainAspectRatio: true,
				// aspectRatio: 2.0,
				maintainAspectRatio: false,
				aspectRatio: 1,
				plugins: {
					tooltip: {
						mode: "index",
						intersect: false,
						callbacks: {
							label: (context) => {
								const label = context.dataset.label || "";
								const value = context.parsed.y || 0;
								return `${label}: ${this.currencyPipe.transform(value, "BRL", "symbol", "1.2-2")}`;
							}
						}
					},
					legend: {
						position: "top"
					}
				},
				scales: {
					x: {},
					y: {
						ticks: {
							callback: (value, index, ticks) => {
								return `${this.currencyPipe.transform(value, "BRL", "symbol", "1.2-2")}`;
							},
						}
					}
				}
			};
		}
	}
}
