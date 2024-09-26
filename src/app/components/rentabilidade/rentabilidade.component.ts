import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import 'chartjs-adapter-date-fns';
import { parse, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { setDefaultOptions } from "date-fns/setDefaultOptions";
import { ChartModule } from "primeng/chart";
import { DropdownModule } from 'primeng/dropdown';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from "primeng/table";
import { KinvoPortfolio } from "../../dtos/kinvo-portfolio";
import { CapitalGainByProductTableItem } from "../../models/capital-gain-by-product-table-item";
import { KinvoServiceApi } from "../../services/kinvo.service.api";
setDefaultOptions({ locale: ptBR })

@Component({
	selector: "app-rentabilidade",
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		TableModule,
		ChartModule,
		DropdownModule,
		SelectButtonModule
	],
	providers: [KinvoServiceApi],
	templateUrl: "./rentabilidade.component.html",
	styleUrl: "./rentabilidade.component.scss",
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class RentabilidadeComponent implements OnInit {

	portfolios!: KinvoPortfolio[];

	private _portfolioSelected!: number;

	public get portfolioSelected(): number {
		return this._portfolioSelected;
	}

	public set portfolioSelected(value: number) {
		this._portfolioSelected = value;
		this.loadPortfolioProfitability();
		this.loadCapitalGainByPortfolio();
	}

	chartTypes: string[] = [
		"Rentabilidade",
		"Ganho de Capital",
		"Movimentação",
		"Patrimônio",
		"Tabela resumo",
	]

	chartTypeSelected: string = this.chartTypes[0];

	chart: "bar" | "line" | "scatter" | "bubble" | "pie" | "doughnut" | "polarArea" | "radar" = "line";

	chartData: any;

	chartOptions: any;

	capitalGainTable: CapitalGainByProductTableItem[] = [];

	constructor(
		private kinvoServiceApi: KinvoServiceApi
	) { }

	ngOnInit() {
		this.loadPortfolioData();
	}

	loadPortfolioData() {
		this.kinvoServiceApi.getPortfolios().subscribe((data) => {
			if (data.success) {
				this.portfolios = data.data;
				this.portfolioSelected = this.portfolios[0].id;
			}
		});
	}

	loadCapitalGainByPortfolio() {

		this.kinvoServiceApi.getCapitalGainByPortfolio(this.portfolioSelected).subscribe((data) => {

			if (data.success) {

				const monthlyReferenceDate: Record<string, CapitalGainByProductTableItem> = {};

				for (const element of data.data.capitalGainByProductInTheMonth) {

					if (!monthlyReferenceDate[element.monthlyReferenceDate]) {

						monthlyReferenceDate[element.monthlyReferenceDate] = {
							monthlyReferenceDate: new Date(element.monthlyReferenceDate),
							initialEquity: 0,
							finalEquity: 0,
							valueApplied: 0,
							net: 0,
							applications: 0,
							redemptions: 0,
							returns: 0,
							proceeds: 0,
							capitalGain: 0,
							checkingAccount: 0,
							amortization: 0
						};
					}

					const tableRow = monthlyReferenceDate[element.monthlyReferenceDate];

					tableRow.initialEquity += element.initialEquity;
					tableRow.finalEquity += element.finalEquity;
					tableRow.valueApplied += element.valueApplied;
					tableRow.net += element.net;
					tableRow.applications += element.applications;
					tableRow.redemptions += element.redemptions;
					tableRow.returns += element.returns;
					tableRow.proceeds += element.proceeds;
					tableRow.capitalGain += element.capitalGain;
					tableRow.checkingAccount += element.checkingAccount;
					tableRow.amortization += element.amortization;
				}

				this.capitalGainTable = Object.values(monthlyReferenceDate);
				this.capitalGainTable.sort((a, b) => b.monthlyReferenceDate.getTime() - a.monthlyReferenceDate.getTime());
			}
		});
	}

	loadPortfolioProfitability() {

		this.kinvoServiceApi.getPeriodicPortfolioProfitability(this.portfolioSelected).subscribe((data) => {

			if (data.success) {

				this.chartData = {
					labels: data.data.dailyProfitabilityToChart.categories.map(element => parseISO(element as string)),
					datasets: data.data.dailyProfitabilityToChart.series.map((serie: any) => {
						const element = {
							label: serie.name,
							data: serie.data,
							fill: false,
							tension: 0,
							borderWidth: 1,
							borderColor: "",
							backgroundColor: "",
						};

						switch (serie.name) {

							case "Carteira":
								element.borderColor = '#004D40';
								element.backgroundColor = '#004D40';
								break;
							case "CDI":
								element.borderColor = '#01579B';
								element.backgroundColor = '#01579B';
								break;
							case "IBOV":
								element.borderColor = '#F57F17';
								element.backgroundColor = '#F57F17';
								break;
							case "Inflação (IPCA)":
								element.borderColor = '#BF360C';
								element.backgroundColor = '#BF360C';
								break;
							case "Poupança":
								element.borderColor = '#4A148C';
								element.backgroundColor = '#4A148C';
								break;

						}

						return element;
					}),
				};

				this.chartOptions = {
					elements: {
						point: {
							radius: 0
						}
					},
					interaction: {
						mode: "index",
						intersect: false,
					},
					maintainAspectRatio: true,
					// aspectRatio: 1,
					plugins: {
						// decimation: "min-max",
						legend: {
							position: "bottom",
							labels: {
								// color: textColor,
							},
						},
						// title: {
						// 	text: "Rentabilidade %",
						// 	display: true,
						// },
						// zoom: {
						// 	pan: {
						// 		enabled: true,
						// 		mode: "x",
						// 	},
						// 	zoom: {
						// 		enabled: true,
						// 		mode: "x",
						// 	},
						// },

					},
					scales: {
						// adapters: {
						// 	date: {
						// 		locale: ptBR
						// 	}
						// },
						x: {
							type: 'time',
							time: {
								displayFormats: {
									quarter: 'MMM YYYY'
								}
							},
							// type: 'time',
							// time: {
							// 	unit: 'month'
							// }
							// type: 'time',
							// time: {
							//   // Luxon format string
							//   tooltipFormat: 'DD T'
							// },
							// title: {
							//   display: true,
							//   text: 'Date'
							// }
							// ticks: {
							// 	callback: (value: any, index: any, ticks: any) => {
							// 		console.log(value)
							// 		return parse() value;
							// 	}
							// }
							// color: textColorSecondary
							// callback: (value: any, index: any, ticks: any) => {
							// 	console.log(value, index, ticks);

							// 	return "";
							// },
							// },
							// grid: {
							//     color: surfaceBorder,
							//     drawBorder: false
							// }

						},
						y: {
							ticks: {
								// color: textColorSecondary,
								callback: (value: any, index: any, ticks: any) => {
									return `${value}%`;
								},
							},
							grid: {
								// color: surfaceBorder,
								drawBorder: false,
							},
						},
					},
				};
			}
		});
	}
}
