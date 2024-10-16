import { CommonModule, CurrencyPipe, PercentPipe } from "@angular/common";
import { Component, Input, OnChanges } from "@angular/core";
import { ChartData, ChartOptions, ChartType, Plugin } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { ChartModule } from "primeng/chart";
import { DataConsolidateAsset } from "../../../models/data-consolidate-asset";

@Component({
	selector: "app-distribuicao",
	standalone: true,
	imports: [
		CommonModule,
		ChartModule
	],
	templateUrl: "./distribuicao.component.html",
	styleUrl: "./distribuicao.component.scss"
})
export class DistribuicaoComponent implements OnChanges {

	@Input()
	consolidateAssetsFiltered!: Partial<DataConsolidateAsset>[];

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
		if (this.consolidateAssetsFiltered) {
			this.buildViewDistribuicao(this.consolidateAssetsFiltered);
		}
	}

	buildViewDistribuicao(consolidateAssetsFiltered: Partial<DataConsolidateAsset>[]) {


		this.chartType = undefined;
		this.chartData = undefined;
		this.chartOptions = undefined;
		this.chartPlugins.splice(0, this.chartPlugins.length);
		this.chartHeight = "100%";

		this.chartType = "doughnut";
		this.chartHeight = window.innerWidth > window.innerHeight ? (window.innerHeight > 450 ? "450px" : "100%") : "50%";


		if (!this.chartPlugins.includes(ChartDataLabels)) {
			this.chartPlugins.push(ChartDataLabels);
		}

		this.chartData = {
			labels: consolidateAssetsFiltered
				.map(element => element.strategyOfDiversificationDescription || element.productTypeName || element.financialInstitutionName),
			datasets: [{
				type: "doughnut",
				label: "Saldo",
				data: consolidateAssetsFiltered.map(element => element.equity) as number[],
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
					// align: "start",
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
					// anchor: "end",
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
