import { CommonModule, CurrencyPipe, PercentPipe } from "@angular/common";
import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { ChartData, ChartOptions, ChartType, ChartTypeRegistry, Plugin, TooltipItem } from "chart.js";
import ChartDataLabels, { Context } from "chartjs-plugin-datalabels";
import { ChartModule } from "primeng/chart";
import { AggregatedDataByLabel } from "../../../models/aggregated-data-by-label";
import { isLandScape, isMediumOrHigherScreen, isPortrait } from "../../../services/viewport.service";
import { ChartSkeletonComponent } from "../../chart-skeleton/chart-skeleton.component";

@Component({
	selector: "app-distribuicao",
	standalone: true,
	imports: [
		CommonModule,
		ChartModule,
		ChartSkeletonComponent
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

	readonly chartType: ChartType = "doughnut";

	chartData: ChartData | undefined;

	chartOptions: ChartOptions | undefined;

	readonly chartPlugins: Plugin[] = [
		{
			id: "legendMargin",
			beforeInit: function (chart) {
				if (chart.legend) {
					const fitValue = chart.legend.fit;
					chart.legend.fit = function fit() {
						fitValue.bind(chart.legend)();
						this.height += isPortrait() ? 24 : 0;
						this.width += isLandScape() ? 48 : 0;
					};
				}
			}
		},
		ChartDataLabels
	];

	chartHeight?: string = undefined;
	chartWidth?: string = undefined;

	readonly colors = ["#29B6F6", "#E67C73", "#FFA726", "#FFEE58", "#26A69A"];

	readonly font = {
		family: "Montserrat",
		weight: 700,
		size: 10
	};

	constructor(
		private currencyPipe: CurrencyPipe,
		private percentPipe: PercentPipe
	) { }

	ngOnChanges(changes: SimpleChanges): void {
		if (changes["aggregatedDataByLabel"]) {
			this.buildChart();
		}
	}

	transformCurrency(value: number): string {
		return this.currencyPipe.transform(value, "BRL", "symbol", "1.2-2") || "";
	}

	transformPercent(value: number): string {
		return this.percentPipe.transform(value, "1.2-2") || "";
	}

	transformLabel(value: number, context: TooltipItem<keyof ChartTypeRegistry> | Context, showLabel: boolean): string {
		const total = (context.dataset.data as number[]).reduce((acc: number, value: number) => acc + value, 0);
		const percent = (value / total);
		const label = showLabel ? context.dataset.label || "" : "";
		return `${label ? label + ": " : ""}${this.transformCurrency(value)} (${this.transformPercent(percent)})`;
	}

	buildChart() {

		this.chartData = undefined;
		this.chartOptions = undefined;

		if (this.aggregatedDataByLabel.length === 0) {
			return;
		}

		this.chartHeight = isLandScape() ? "100%": undefined;
		this.chartWidth = isPortrait() ? "100%": undefined;

		this.aggregatedDataByLabel = [...this.aggregatedDataByLabel].sort((a, b) => b.finalEquity - a.finalEquity);

		this.chartData = {
			labels: this.aggregatedDataByLabel.map(element => element.referenceLabel),
			datasets: [{
				type: "doughnut",
				label: "Saldo",
				data: this.aggregatedDataByLabel.map(element => element.finalEquity),
				backgroundColor: this.colors,
				borderColor: this.colors,
				borderWidth: 1,
				datalabels: {
					align: "end",
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
			layout: {
				padding: {
					left: isPortrait() ? 48 : (isMediumOrHigherScreen() ? (window.innerWidth * 15)/100 : 48),
					right: isPortrait() ? 48 : (isMediumOrHigherScreen() ? (window.innerWidth * 15)/100 : 48),
					top: isPortrait() ? 24 : (isMediumOrHigherScreen() ? (window.innerHeight * 15)/100 : 48),
					bottom: isPortrait() ? 24 : (isMediumOrHigherScreen() ? (window.innerHeight * 15)/100 : 48)
				}
			},
			plugins: {
				tooltip: {
					mode: "index",
					intersect: false,
					callbacks: {
						label: (context) => this.transformLabel(context.raw as number || 0, context, true)
					}
				},
				legend: {
					position: isPortrait() ? "top" : "left",
					labels: {
						font: this.font,
						usePointStyle: true
					}
				},
				datalabels: {
					font: this.font,
					anchor: "end",
					display: true,
					formatter: (value, context) => this.transformLabel(value as number || 0, context, false)
				}
			}
		};
	}
}
