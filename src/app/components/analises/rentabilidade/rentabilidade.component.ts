import { CommonModule, CurrencyPipe, PercentPipe } from "@angular/common";
import { Component, Input, OnChanges } from "@angular/core";
import { ChartData, ChartDataset, ChartOptions, ChartType, Plugin } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { format } from "date-fns/format";
import { ptBR } from "date-fns/locale/pt-BR";
import { ChartModule } from "primeng/chart";
import { DataFull } from "../../../models/data-full";
import { DataProfitability } from "../../../models/data-profitability";
import { DataAggregator } from "../analises.constants";

@Component({
	selector: "app-rentabilidade",
	standalone: true,
	imports: [
		CommonModule,
		ChartModule
	],
	templateUrl: "./rentabilidade.component.html",
	styleUrl: "./rentabilidade.component.scss"
})
export class RentabilidadeComponent implements OnChanges {

	@Input()
	monthlyDataFiltered!: DataFull[];

	@Input()
	dailyDataProfitabilityFiltered!: DataProfitability[];

	@Input()
	aggregatorOptionsSelected: DataAggregator | undefined;

	chartType: ChartType | undefined;
	chartData: ChartData | undefined;
	chartOptions: ChartOptions | undefined;
	chartPlugins: Plugin[] = [];
	chartHeight: string = "100%";

	constructor(
		private currencyPipe: CurrencyPipe,
		private percentPipe: PercentPipe
	) { }

	ngOnChanges() {
		if (this.monthlyDataFiltered && this.dailyDataProfitabilityFiltered && this.aggregatorOptionsSelected) {
			this.buildViewRentabilidade(this.monthlyDataFiltered, this.dailyDataProfitabilityFiltered);
		}
	}

	buildViewRentabilidade(monthlyDataFiltered: DataFull[], dailyDataProfitabilityFiltered: DataProfitability[]) {


		this.chartType = undefined;
		this.chartData = undefined;
		this.chartOptions = undefined;
		this.chartPlugins.splice(0, this.chartPlugins.length);
		this.chartHeight = "100%";

		if (this.aggregatorOptionsSelected == "Ano" || this.aggregatorOptionsSelected == "Mês") {

			if (!this.chartPlugins.includes(ChartDataLabels)) {
				this.chartPlugins.push(ChartDataLabels);
			}

			this.chartType = "bar";
			this.chartHeight = 75 + (20 * monthlyDataFiltered.length * 5) + "px";

			this.chartData = {
				labels: monthlyDataFiltered
					.map(element => element.referenceDate)
					.map(element => format(element, this.aggregatorOptionsSelected == "Ano" ? "yyyy" : "MMM/yyyy", { locale: ptBR })),
				datasets: ["profitabilityCarteira", "profitabilityCdi", "profitabilityIbov", "profitabilityInflacao", "profitabilityPoupanca"].map(serie => {

					const result: ChartDataset = {
						type: "bar",
						label: "",
						data: monthlyDataFiltered.map(element => element[serie as keyof DataFull]) as number[],
						borderWidth: 2,
						borderColor: "",
						backgroundColor: "",
						// hidden: ["profitabilityCdi", "profitabilityIbov", "profitabilityInflacao", "profitabilityPoupanca"].includes(serie),
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
						case "profitabilityCarteira":
							result.label = "Carteira";
							result.borderColor = "#26A69A";
							result.backgroundColor = "#26A69A";
							result.datalabels!.align = "end";
							break;

						case "profitabilityCdi":
							result.label = "CDI";
							result.borderColor = "#29B6F6";
							result.backgroundColor = "#29B6F6";
							result.datalabels!.align = "end";
							break;

						case "profitabilityIbov":
							result.label = "IBOV";
							result.borderColor = "#FFA726";
							result.backgroundColor = "#FFA726";
							result.datalabels!.align = "end";
							break;

						case "profitabilityInflacao":
							result.label = "IPCA";
							result.borderColor = "#e67c73";
							result.backgroundColor = "#e67c73";
							result.datalabels!.align = "end";
							break;

						case "profitabilityPoupanca":
							result.label = "Poupança";
							result.borderColor = "#FFEE58";
							result.backgroundColor = "#FFEE58";
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
								return `${label}: ${this.percentPipe.transform(value, "1.2-2")}`;
							}
						}
					},
					legend: {
						position: "top",
						onClick: (e, legendItem, legend) => {

							const index = legendItem.datasetIndex!;
							const ci = legend.chart;

							if (ci.isDatasetVisible(index)) {
								ci.hide(index);
								legendItem.hidden = true;

							} else {
								ci.show(index);
								legendItem.hidden = false;
							}

							const visibleItens = ci.legend!.legendItems!.map(item => (item.hidden ? 0 : 1) as number).reduce((acc, value) => acc + value, 0);
							const chartHeight = 75 + (20 * monthlyDataFiltered.length * visibleItens);
							(ci.canvas.parentNode as HTMLElement)!.style.height = chartHeight + "px";
						}
					},
					datalabels: {
						anchor: "end",
						display: true,
						formatter: (value, context) => {
							return `${this.percentPipe.transform(value, "1.2-2")}`;
						}
					}
				},
				scales: {
					x: {
						// stacked: false,
						// beginAtZero: true,
						ticks: {
							callback: (value, index, ticks) => {
								return `${this.percentPipe.transform(value, "1.2-2")}`;
							},
						}
					},
					y: {
						// stacked: true
					}
				}
			};

		} else {

			this.chartType = "line";
			this.chartHeight = window.innerWidth < window.innerHeight ? "50%" : "100%";

			this.chartData = {
				labels: dailyDataProfitabilityFiltered.map(element => element.referenceDate),
				datasets: ["carteira", "cdi", "ibov", "inflacao", "poupanca"].map(serie => {

					const result = {
						label: "",
						data: dailyDataProfitabilityFiltered.map(element => element[serie as keyof DataProfitability]) as number[],
						fill: false,
						tension: 0,
						borderWidth: 2,
						borderColor: "",
						backgroundColor: "",
					};

					switch (serie) {
						case "carteira":
							result.label = "Carteira";
							result.borderColor = "#26A69A";
							result.backgroundColor = "#26A69A";
							break;

						case "cdi":
							result.label = "CDI";
							result.borderColor = "#29B6F6";
							result.backgroundColor = "#29B6F6";
							break;

						case "ibov":
							result.label = "IBOV";
							result.borderColor = "#FFA726";
							result.backgroundColor = "#FFA726";
							break;

						case "inflacao":
							result.label = "IPCA";
							result.borderColor = "#e67c73";
							result.backgroundColor = "#e67c73";
							break;

						case "poupanca":
							result.label = "Poupança";
							result.borderColor = "#FFEE58";
							result.backgroundColor = "#FFEE58";
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
				elements: {
					point: {
						radius: 0
					}
				},
				// maintainAspectRatio: true,
				// responsive: true,
				// aspectRatio: 1,
				maintainAspectRatio: false,
				aspectRatio: 1,
				plugins: {
					// decimation: "min-max",
					tooltip: {
						mode: "index",
						intersect: false,
						callbacks: {
							label: (context) => {
								const label = context.dataset.label || "";
								const value = context.parsed.y || 0;
								return `${label}: ${this.percentPipe.transform(value / 100, "1.2-2")}`;
							},
							title: (context) => {
								const date = context[0].parsed.x;
								return format(date, "dd/MM/yyyy", { locale: ptBR });
							}
						}
					},
					legend: {
						position: "top"
					}
				},
				scales: {
					// adapters: {
					// 	date: {
					// 		locale: ptBR
					// 	}
					// },
					x: {
						type: "time",
						time: {
							displayFormats: {
								quarter: "MMM YYYY"
							}
						}
					},
					y: {
						ticks: {
							callback: (value: any, index: any, ticks: any) => {
								return `${this.percentPipe.transform(value / 100, "1.2-2")}`;
							},
						}
					},
				}
			};
		}
	}
}
