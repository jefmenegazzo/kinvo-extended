import { CommonModule, PercentPipe } from "@angular/common";
import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { ChartData, ChartDataset, ChartOptions, ChartType, Plugin } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { format } from "date-fns/format";
import { ptBR } from "date-fns/locale/pt-BR";
import { ChartModule } from "primeng/chart";
import { AggregatedDataByDate } from "../../../models/aggregated-data-by-date";
import { AggregatedProfitabilityByDate } from "../../../models/aggregated-profitability-by-date";
import { DataAggregator } from "../analises.component";

@Component({
	selector: "app-rentabilidade",
	standalone: true,
	imports: [
		CommonModule,
		ChartModule
	],
	providers: [
		PercentPipe
	],
	templateUrl: "./rentabilidade.component.html",
	styleUrl: "./rentabilidade.component.scss"
})
export class RentabilidadeComponent implements OnChanges {

	@Input()
	loading: boolean = false;

	@Input()
	aggregatedProfitabilityByDate: AggregatedProfitabilityByDate[] = [];

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
		private percentPipe: PercentPipe
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

		if (changes["aggregatedProfitabilityByDate"] || changes["aggregatedDataByDate"]) {
			this.buildChart();
		}
	}

	buildChart() {

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
			this.chartHeight = 75 + (20 * this.aggregatedDataByDate.length * 5) + "px";

			this.chartData = {
				labels: this.aggregatedDataByDate.map(element => format(element.referenceDate, this.dateFormat, { locale: ptBR })),
				datasets: (["profitabilityCarteira", "profitabilityCdi", "profitabilityIbov", "profitabilityInflacao", "profitabilityPoupanca"] as
					(keyof Pick<AggregatedDataByDate, "profitabilityCarteira" | "profitabilityCdi" | "profitabilityIbov" | "profitabilityInflacao" | "profitabilityPoupanca">)[]).map(serie => {

						const result: ChartDataset = {
							type: "bar",
							label: "",
							data: this.aggregatedDataByDate.map(element => element[serie]),
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
							const chartHeight = 75 + (20 * this.aggregatedDataByDate.length * visibleItens);
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
				labels: this.aggregatedProfitabilityByDate.map(element => element.referenceDate),
				datasets: (["carteira", "cdi", "ibov", "inflacao", "poupanca"] as (keyof Pick<AggregatedProfitabilityByDate, "carteira" | "cdi" | "ibov" | "inflacao" | "poupanca">)[]).map(serie => {

					const result = {
						label: "",
						data: this.aggregatedProfitabilityByDate.map(element => element[serie]),
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
