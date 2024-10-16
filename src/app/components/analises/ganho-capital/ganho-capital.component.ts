import { CommonModule, CurrencyPipe, PercentPipe } from "@angular/common";
import { Component, Input, OnChanges } from "@angular/core";
import { ChartData, ChartDataset, ChartOptions, ChartType, Plugin } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { format } from "date-fns/format";
import { ptBR } from "date-fns/locale/pt-BR";
import { ChartModule } from "primeng/chart";
import { DataFull } from "../../../models/data-full";
import { DataAggregator } from "../analises.constants";

@Component({
	selector: "app-ganho-capital",
	standalone: true,
	imports: [
		CommonModule,
		ChartModule
	],
	templateUrl: "./ganho-capital.component.html",
	styleUrl: "./ganho-capital.component.scss"
})
export class GanhoCapitalComponent implements OnChanges {

	@Input()
	monthlyDataFiltered!: DataFull[];

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
		if (this.monthlyDataFiltered) {
			this.buildViewGanhoCapital(this.monthlyDataFiltered);
		}
	}

	buildViewGanhoCapital(monthlyDataFiltered: DataFull[]) {


		this.chartType = undefined;
		this.chartData = undefined;
		this.chartOptions = undefined;
		this.chartPlugins.splice(0, this.chartPlugins.length);
		this.chartHeight = "100%";

		this.chartType = "bar";
		this.chartHeight = 75 + (20 * monthlyDataFiltered.length) + "px";

		if (!this.chartPlugins.includes(ChartDataLabels)) {
			this.chartPlugins.push(ChartDataLabels);
		}

		this.chartData = {
			labels: monthlyDataFiltered
				.map(element => element.referenceDate)
				.map(element => format(element, this.aggregatorOptionsSelected == "Ano" ? "yyyy" : "MMM/yyyy", { locale: ptBR })),
			datasets: ["capitalGain", "charges"].map(serie => {

				const result: ChartDataset = {
					type: "bar",
					label: "",
					data: monthlyDataFiltered.map(element => element[serie as keyof DataFull]) as number[],
					borderWidth: 1,
					borderColor: "",
					backgroundColor: "",
					hidden: serie === "charges",
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
					case "capitalGain":
						result.label = "Ganho de Capital";
						result.borderColor = (ctx) => ctx.raw as number < 0 ? "#e67c73" : "#26A69A";
						result.backgroundColor = (ctx) => ctx.raw as number < 0 ? "#e67c73" : "#26A69A";
						result.datalabels!.align = "start";
						break;

					case "charges":
						result.label = "Encargos";
						result.borderColor = "#FFEB3B";
						result.backgroundColor = "#FFEB3B";
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
					stacked: true,
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
	}
}
