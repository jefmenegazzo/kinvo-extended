import { CommonModule, CurrencyPipe, PercentPipe } from "@angular/common";
import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { ChartData, ChartOptions, ChartType, Plugin } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { ChartModule } from "primeng/chart";
import { AggregatedDataByLabel } from "../../../models/aggregated-data-by-label";

@Component({
	selector: "app-distribuicao",
	standalone: true,
	imports: [
		CommonModule,
		ChartModule
	],
	providers: [
		CurrencyPipe,
		PercentPipe
	],
	templateUrl: "./distribuicao.component.html",
	styleUrl: "./distribuicao.component.scss"
})
export class DistribuicaoComponent implements OnChanges {

	@Input()
	loading: boolean = false;

	@Input()
	aggregatedDataByLabel: AggregatedDataByLabel[] = [];

	chartType: ChartType | undefined;
	chartData: ChartData | undefined;
	chartOptions: ChartOptions | undefined;
	chartPlugins: Plugin[] = [];
	chartHeight: string = "100%";

	constructor(
		private currencyPipe: CurrencyPipe,
		private percentPipe: PercentPipe
	) { }

	ngOnChanges(changes: SimpleChanges): void {
		if (changes["aggregatedDataByLabel"]) {
			this.buildChart();
		}
	}

	buildChart() {

		this.chartType = undefined;
		this.chartData = undefined;
		this.chartOptions = undefined;
		this.chartPlugins.splice(0, this.chartPlugins.length);
		this.chartHeight = "100%";

		this.chartType = "doughnut";
		this.chartHeight = window.innerWidth > window.innerHeight ? (window.innerHeight > 450 ? "450px" : "100%") : "50%";

		this.chartPlugins.push({
			id: "legendMargin",
			beforeInit: function (chart) {
				if (chart.legend) {
					const fitValue = chart.legend.fit;
					chart.legend.fit = function fit() {
						fitValue.bind(chart.legend)();
						return (this.height += 20);
					};
				}
			}
		});

		if (!this.chartPlugins.includes(ChartDataLabels)) {
			this.chartPlugins.push(ChartDataLabels);
		}

		if (this.aggregatedDataByLabel.length === 0) {
			return;
		}

		this.chartData = {
			labels: this.aggregatedDataByLabel.map(element => element.referenceLabel),
			datasets: [{
				type: "doughnut",
				label: "Saldo",
				data: this.aggregatedDataByLabel.map(element => element.finalEquity),
				backgroundColor: [
					"#29B6F6",
					"#e67c73",
					"#FFA726",
					"#FFEE58",
					"#26A69A"
				],
				borderColor: [
					"#29B6F6",
					"#e67c73",
					"#FFA726",
					"#FFEE58",
					"#26A69A"
				],
				borderWidth: 1,
				hoverOffset: 4,
				datalabels: {
					align: "end",
					font: {
						family: "Montserrat",
						weight: 700,
						size: 10
					}
				}
			}]
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
							const total = (context.dataset.data as number[]).reduce((acc: number, value: number) => acc + value, 0);
							const label = context.dataset.label || "";
							const value = context.raw as number || 0;
							const percent = (value / total);
							return `${label}: ${this.currencyPipe.transform(value, "BRL", "symbol", "1.2-2")} (${this.percentPipe.transform(percent, "1.2-2")})`;
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
						const total = (context.dataset.data as number[]).reduce((acc: number, value: number) => acc + value, 0);
						const percent = (value / total);
						return `${this.currencyPipe.transform(value, "BRL", "symbol", "1.2-2")} (${this.percentPipe.transform(percent, "1.2-2")})`;
					}
				}
			}
		};
	}
}
