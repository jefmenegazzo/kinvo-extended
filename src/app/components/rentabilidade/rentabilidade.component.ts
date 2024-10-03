/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule, CurrencyPipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ChartData, ChartDataset, ChartOptions, Plugin } from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { format, lastDayOfMonth, max, min, parse, parseISO } from 'date-fns';
import { ptBR } from "date-fns/locale/pt-BR";
import { ButtonModule } from "primeng/button";
import { CalendarModule } from "primeng/calendar";
import { ChartModule } from "primeng/chart";
import { DropdownModule } from 'primeng/dropdown';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from "primeng/table";
import { finalize, forkJoin, tap } from "rxjs";
import { KinvoApiResponse } from "../../dtos/kinvo-api-response";
import { KinvoCapitalGain } from "../../dtos/kinvo-capital-gain";
import { KinvoPortfolio } from "../../dtos/kinvo-portfolio";
import { KinvoPortfolioProduct } from "../../dtos/kinvo-portfolio-product";
import { KinvoPortfolioProfitability } from "../../dtos/kinvo-portfolio-profitability";
import { CapitalGainByProductTableItem } from "../../models/capital-gain-by-product-table-item";
import { KinvoServiceApi } from "../../services/kinvo.service.api";

@Component({
	selector: "app-rentabilidade",
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		TableModule,
		ChartModule,
		DropdownModule,
		SelectButtonModule,
		ButtonModule,
		CalendarModule,
		SkeletonModule
	],
	providers: [
		KinvoServiceApi,
		CurrencyPipe
	],
	templateUrl: "./rentabilidade.component.html",
	styleUrl: "./rentabilidade.component.scss",
	// changeDetection: ChangeDetectionStrategy.OnPush
})
export class RentabilidadeComponent implements OnInit {

	portfolioData: KinvoPortfolio[] = [];
	portfolioDataSelected!: number;
	portfolioDataLoading: boolean = false;

	dataAnalysisTypes: string[] = ["Tabela Resumo", "Rentabilidade", "Ganho de Capital", "Movimentação", "Patrimônio"]
	dataAnalysisTypesSelected: string = this.dataAnalysisTypes[0];

	dataIntervalOptions: string[] = ["No Mês", "3 Meses", "6 Meses", "12 Meses", "24 Meses", "No Ano", "Do Início", "Personalizado"]
	dataIntervalOptionsSelected: string = this.dataIntervalOptions[6];
	dateRange: Date[] | undefined = [];

	chartType: "bar" | "line" | "scatter" | "bubble" | "pie" | "doughnut" | "polarArea" | "radar" = "line";
	chartData: ChartData | undefined;
	chartOptions: ChartOptions | undefined;
	chartPlugins: Plugin[] = [];

	tableData: CapitalGainByProductTableItem[] = [];
	tableDataTotalsRow: CapitalGainByProductTableItem = {} as CapitalGainByProductTableItem;
	tableColumns: (keyof CapitalGainByProductTableItem)[] = [
		"monthlyReferenceDate", "valueApplied", "initialEquity", "applications", "redemptions", "movementations",
		"returns", "proceeds", "capitalGain", "finalEquity", "incomeTax", "iof", "cost", "charges",
		"profitabilityCarteira", "profitabilityCdi", "profitabilityIbov", "profitabilityInflacao", "profitabilityPoupanca"
	];

	dataFull: CapitalGainByProductTableItem[] = [];
	dataFullLoading: boolean = false;

	constructor(
		private kinvoServiceApi: KinvoServiceApi,
		private currencyPipe: CurrencyPipe
	) { }

	ngOnInit() {
		this.loadPortfolioData();
	}

	loadPortfolioData() {

		if (this.portfolioDataLoading) {
			return;
		}

		this.portfolioDataLoading = true;

		this.kinvoServiceApi.getPortfolios()
			.pipe(
				finalize(() => {
					this.portfolioDataLoading = false;
				})
			)
			.subscribe((data) => {
				if (data.success) {
					this.portfolioData = data.data;
					this.portfolioDataSelected = this.portfolioData.find(element => element.isPrincipal)!.id;
					this.onPorfolioChange();
				}
			});
	}

	onPorfolioChange() {
		this.loadDataFull();
	}

	onDataIntervalChange(event?: Date[]) {

		const allMonths = this.dataFull.map(element => element.monthlyReferenceDate);
		let [minMonth, maxMonth]: [Date | undefined, Date | undefined] = [min(allMonths), max(allMonths)];

		switch (this.dataIntervalOptionsSelected) {
			case "No Mês":
				minMonth = new Date();
				minMonth.setDate(1);
				minMonth.setHours(0, 0, 0, 0);
				break;
			case "3 Meses":
				minMonth = new Date();
				minMonth.setMonth(minMonth.getMonth() - 2);
				minMonth.setDate(1);
				minMonth.setHours(0, 0, 0, 0);
				break;
			case "6 Meses":
				minMonth = new Date();
				minMonth.setMonth(minMonth.getMonth() - 5);
				minMonth.setDate(1);
				minMonth.setHours(0, 0, 0, 0);
				break;
			case "12 Meses":
				minMonth = new Date();
				minMonth.setMonth(minMonth.getMonth() - 11);
				minMonth.setDate(1);
				minMonth.setHours(0, 0, 0, 0);
				break;
			case "24 Meses":
				minMonth = new Date();
				minMonth.setMonth(minMonth.getMonth() - 23);
				minMonth.setDate(1);
				minMonth.setHours(0, 0, 0, 0);
				break;
			case "No Ano":
				minMonth = new Date();
				minMonth.setMonth(0);
				minMonth.setDate(1);
				minMonth.setHours(0, 0, 0, 0);
				break;
			case "Do Início":
				minMonth.setDate(1);
				minMonth.setHours(0, 0, 0, 0);
				break;
			case "Personalizado":

				if (event) {
					minMonth = event![0];
					maxMonth = event![1];
					minMonth.setDate(1);
					minMonth.setHours(0, 0, 0, 0);
					break;

				} else {
					this.dateRange = undefined;
					return;
				}
		}

		const rangeIni = minMonth;
		const rangeEnd = maxMonth ? lastDayOfMonth(maxMonth) : maxMonth;
		this.dateRange = [rangeIni, rangeEnd];

		this.applyDataFilters();
	}

	onDataAnalysisTypeChange() {
		this.applyDataFilters();
	}

	loadDataFull() {

		if (this.dataFullLoading) {
			return;
		}

		this.dataFullLoading = true
		this.tableData = [];
		this.chartData = undefined;
		this.chartOptions = undefined;

		forkJoin([
			this.kinvoServiceApi.getCapitalGainByPortfolio(this.portfolioDataSelected),
			this.kinvoServiceApi.getPeriodicPortfolioProfitability(this.portfolioDataSelected),
			this.kinvoServiceApi.getPortfolioProductByPortfolio(this.portfolioDataSelected)
		]).pipe(
			finalize(() => {
				// this.dataFullLoading = false;
			})
		).subscribe(([capitalGain, profitability, products]) => {

			// this.dataFullLoading = true;

			forkJoin(
				products.data?.map(product =>
					this.kinvoServiceApi.getProductStatementByProduct(product.portfolioProductId).pipe(
						tap(response => {
							if (response.success) {
								product.statements = response;
							}
						})
					))
			).pipe(
				finalize(() => {
					this.dataFullLoading = false;
				})
			).subscribe(() => {

				if (capitalGain.success && profitability.success && products.success) {
					this.mergeDataFull(capitalGain, profitability, products);
					this.onDataIntervalChange();
				}
			});
		});
	}

	createCapitalGainByProductTableItem(monthlyReferenceDate: string): CapitalGainByProductTableItem {

		return {
			monthlyReferenceDate: parseISO(monthlyReferenceDate),
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

	mergeDataFull(capitalGain: KinvoApiResponse<KinvoCapitalGain>, profitability: KinvoApiResponse<KinvoPortfolioProfitability>, products: KinvoApiResponse<KinvoPortfolioProduct[]>) {

		let dataAggregatedByMonth: Record<string, CapitalGainByProductTableItem> = {};

		for (const element of capitalGain.data.capitalGainByProductInTheMonth) {

			if (!dataAggregatedByMonth[element.monthlyReferenceDate]) {
				dataAggregatedByMonth[element.monthlyReferenceDate] = this.createCapitalGainByProductTableItem(element.monthlyReferenceDate);
			}

			const tableRow = dataAggregatedByMonth[element.monthlyReferenceDate];
			tableRow.valueApplied += element.valueApplied;
			tableRow.initialEquity += element.initialEquity;
			tableRow.applications += element.applications;
			tableRow.redemptions += element.redemptions;
			tableRow.returns += element.returns;
			tableRow.proceeds += element.proceeds;
			tableRow.capitalGain += element.capitalGain;
			tableRow.finalEquity += element.finalEquity;
		}

		const capitalGainTable = Object.values(dataAggregatedByMonth);
		capitalGainTable.sort((a, b) => b.monthlyReferenceDate.getTime() - a.monthlyReferenceDate.getTime());

		dataAggregatedByMonth = {};

		for (const product of products.data) {

			for (const statement of product.statements.data) {

				const referenceDate = parseISO(statement.date);
				referenceDate.setUTCDate(1);
				const monthlyReferenceDate = referenceDate.toISOString();

				if (!dataAggregatedByMonth[monthlyReferenceDate]) {
					dataAggregatedByMonth[monthlyReferenceDate] = this.createCapitalGainByProductTableItem(monthlyReferenceDate);
				}

				const tableRow = dataAggregatedByMonth[monthlyReferenceDate];
				tableRow.incomeTax += statement.incomeTax || 0;
				tableRow.iof += statement.iof || 0;
				tableRow.cost += statement.cost || 0;

				if (statement.movementType === 0) {
					tableRow.proceeds += statement.equity;

				} else if (statement.movementType === 1) {
					tableRow.applications += statement.equity;

				} else if (statement.movementType === 2 || statement.movementType === 3) {
					tableRow.redemptions += statement.equity;
				}
			}
		}

		const productsStatements = Object.values(dataAggregatedByMonth);
		productsStatements.sort((a, b) => b.monthlyReferenceDate.getTime() - a.monthlyReferenceDate.getTime());

		const profitabilityCategories = profitability.data.monthlyProfitabilityToChart.categories;
		const profitabilitySeries = profitability.data.monthlyProfitabilityToChart.series;
		const profitabilityMonthyData = {
			months: profitabilityCategories.map(element => parse(element as string, 'MMM. yy', new Date(), { locale: ptBR })),
			carteira: profitabilitySeries.find((serie: any) => serie.name === "Carteira")?.data,
			cdi: profitabilitySeries.find((serie: any) => serie.name === "CDI")?.data,
			ibov: profitabilitySeries.find((serie: any) => serie.name === "IBOV")?.data,
			inflacao: profitabilitySeries.find((serie: any) => serie.name === "Inflação (IPCA)")?.data,
			poupanca: profitabilitySeries.find((serie: any) => serie.name === "Poupança")?.data
		};

		for (const element of capitalGainTable) {
			const productsStatementsElement = productsStatements.find(iterator => iterator.monthlyReferenceDate.getTime() === element.monthlyReferenceDate.getTime());
			element.movementations = element.finalEquity - (element.initialEquity + element.capitalGain)
			element.incomeTax = productsStatementsElement?.incomeTax || 0;
			element.iof = productsStatementsElement?.iof || 0;
			element.cost = productsStatementsElement?.cost || 0;
			element.charges = element.incomeTax + element.iof + element.cost
			element.applications = productsStatementsElement?.applications || 0;
			element.redemptions = productsStatementsElement?.redemptions || 0;
			element.proceeds = productsStatementsElement?.proceeds || 0;

			const profitabilityMonthyDataIndex = profitabilityMonthyData.months.findIndex(date => date.getTime() === element.monthlyReferenceDate.getTime());
			element.profitabilityCarteira = (profitabilityMonthyData?.carteira?.[profitabilityMonthyDataIndex] || 0) / 100;
			element.profitabilityCdi = (profitabilityMonthyData?.cdi?.[profitabilityMonthyDataIndex] || 0) / 100;
			element.profitabilityIbov = (profitabilityMonthyData?.ibov?.[profitabilityMonthyDataIndex] || 0) / 100;
			element.profitabilityInflacao = (profitabilityMonthyData?.inflacao?.[profitabilityMonthyDataIndex] || 0) / 100;
			element.profitabilityPoupanca = (profitabilityMonthyData?.poupanca?.[profitabilityMonthyDataIndex] || 0) / 100;

			element.profitabilityCarteiraPercentCdi = element.profitabilityCarteira < 0 || element.profitabilityCdi < 0 ? undefined : element.profitabilityCarteira / element.profitabilityCdi;
			element.profitabilityCarteiraPercentIbov = element.profitabilityCarteira < 0 || element.profitabilityIbov < 0 ? undefined : element.profitabilityCarteira / element.profitabilityIbov;
			element.profitabilityCarteiraPercentInflacao = element.profitabilityCarteira < 0 || element.profitabilityInflacao < 0 ? undefined : element.profitabilityCarteira / element.profitabilityInflacao;
			element.profitabilityCarteiraPercentPoupanca = element.profitabilityCarteira < 0 || element.profitabilityPoupanca < 0 ? undefined : element.profitabilityCarteira / element.profitabilityPoupanca;
		}

		this.dataFull = capitalGainTable;
	}

	downloadCSV() {

		const csvHeader = this.tableColumns.join(';') + '\n'; // header row
		const csvBody = this.tableData.map(row => this.tableColumns.map(column => {

			let value: number | Date | undefined | string = row[column];

			if (value instanceof Date) {
				value = format(value, 'MM/yyyy', { locale: ptBR });

			} else if (typeof value === 'number') {
				value = value.toFixed(4).replace(",", "").replace('.', ',');
			}

			return value;

		}).join(';')).join('\n');

		const hiddenElement = document.createElement('a');
		hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csvHeader + csvBody);
		hiddenElement.target = '_blank';
		hiddenElement.download = 'data.csv';
		hiddenElement.click();
	}

	applyDataFilters() {

		this.tableData = [];
		this.chartData = undefined;
		this.chartOptions = undefined;
		this.tableDataTotalsRow = this.createCapitalGainByProductTableItem(new Date().toISOString());

		const filteredData = this.dataFull.filter(element => {
			const date = element.monthlyReferenceDate;
			return date >= this.dateRange![0] && date <= this.dateRange![1];
		});

		if (this.dataAnalysisTypesSelected === "Tabela Resumo") {

			if (this.chartPlugins.includes(ChartDataLabels)) {
				this.chartPlugins.splice(this.chartPlugins.indexOf(ChartDataLabels), 1);
			}

			this.tableData = [...filteredData];

			for (const element of this.tableData) {
				this.tableDataTotalsRow.valueApplied += element.valueApplied;
				this.tableDataTotalsRow.initialEquity += element.initialEquity;
				this.tableDataTotalsRow.applications += element.applications;
				this.tableDataTotalsRow.redemptions += element.redemptions;
				this.tableDataTotalsRow.movementations += element.movementations;
				this.tableDataTotalsRow.returns += element.returns;
				this.tableDataTotalsRow.proceeds += element.proceeds;
				this.tableDataTotalsRow.capitalGain += element.capitalGain;
				this.tableDataTotalsRow.finalEquity += element.finalEquity;
				this.tableDataTotalsRow.incomeTax += element.incomeTax;
				this.tableDataTotalsRow.iof += element.iof;
				this.tableDataTotalsRow.cost += element.cost;
				this.tableDataTotalsRow.charges += element.charges;
				this.tableDataTotalsRow.profitabilityCarteira += element.profitabilityCarteira;
				this.tableDataTotalsRow.profitabilityCdi += element.profitabilityCdi;
				this.tableDataTotalsRow.profitabilityIbov += element.profitabilityIbov;
				this.tableDataTotalsRow.profitabilityInflacao += element.profitabilityInflacao;
				this.tableDataTotalsRow.profitabilityPoupanca += element.profitabilityPoupanca;
			}

			this.tableDataTotalsRow.profitabilityCarteiraPercentCdi = this.tableDataTotalsRow.profitabilityCarteira < 0 || this.tableDataTotalsRow.profitabilityCdi < 0 ? undefined : this.tableDataTotalsRow.profitabilityCarteira / this.tableDataTotalsRow.profitabilityCdi;
			this.tableDataTotalsRow.profitabilityCarteiraPercentIbov = this.tableDataTotalsRow.profitabilityCarteira < 0 || this.tableDataTotalsRow.profitabilityIbov < 0 ? undefined : this.tableDataTotalsRow.profitabilityCarteira / this.tableDataTotalsRow.profitabilityIbov;
			this.tableDataTotalsRow.profitabilityCarteiraPercentInflacao = this.tableDataTotalsRow.profitabilityCarteira < 0 || this.tableDataTotalsRow.profitabilityInflacao < 0 ? undefined : this.tableDataTotalsRow.profitabilityCarteira / this.tableDataTotalsRow.profitabilityInflacao;
			this.tableDataTotalsRow.profitabilityCarteiraPercentPoupanca = this.tableDataTotalsRow.profitabilityCarteira < 0 || this.tableDataTotalsRow.profitabilityPoupanca < 0 ? undefined : this.tableDataTotalsRow.profitabilityCarteira / this.tableDataTotalsRow.profitabilityPoupanca;

		} else if (this.dataAnalysisTypesSelected === "Rentabilidade") {

			if (this.chartPlugins.includes(ChartDataLabels)) {
				this.chartPlugins.splice(this.chartPlugins.indexOf(ChartDataLabels), 1);
			}

			this.chartType = "line";

			this.chartData = {
				labels: filteredData.map(element => element.monthlyReferenceDate),
				datasets: ["profitabilityCarteira", "profitabilityCdi", "profitabilityIbov", "profitabilityInflacao", "profitabilityPoupanca"].map(serie => {

					const result = {
						label: "",
						data: [] as number[],
						fill: false,
						tension: 0,
						borderWidth: 1,
						borderColor: "",
						backgroundColor: "",
					};

					if (serie === "profitabilityCarteira") {
						result.label = "Carteira";
						result.data = filteredData.map(element => element.profitabilityCarteira * 100);
						result.borderColor = '#004D40';
						result.backgroundColor = '#004D40';

					} else if (serie === "profitabilityCdi") {
						result.label = "CDI";
						result.data = filteredData.map(element => element.profitabilityCdi * 100);
						result.borderColor = '#01579B';
						result.backgroundColor = '#01579B';

					} else if (serie === "profitabilityIbov") {
						result.label = "IBOV";
						result.data = filteredData.map(element => element.profitabilityIbov * 100);
						result.borderColor = '#F57F17';
						result.backgroundColor = '#F57F17';

					} else if (serie === "profitabilityInflacao") {
						result.label = "Inflação (IPCA)";
						result.data = filteredData.map(element => element.profitabilityInflacao * 100);
						result.borderColor = '#BF360C';
						result.backgroundColor = '#BF360C';

					} else if (serie === "profitabilityPoupanca") {
						result.label = "Poupança";
						result.data = filteredData.map(element => element.profitabilityPoupanca * 100);
						result.borderColor = '#4A148C';
						result.backgroundColor = '#4A148C';
					}

					return result;
				})
			}

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
				responsive: true,
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
							// drawBorder: false,
						},
					},
				},
			};


		} else if (this.dataAnalysisTypesSelected === "Ganho de Capital") {

			this.chartType = "bar";

			if (!this.chartPlugins.includes(ChartDataLabels)) {
				this.chartPlugins.push(ChartDataLabels);
			}

			this.chartData = {
				labels: filteredData
					.map(element => element.monthlyReferenceDate)
					.map(element => format(element, 'MMM/yyyy', { locale: ptBR })),
				datasets: ["capitalGain", "charges"].map(serie => {

					const result: ChartDataset = {
						type: 'bar',
						label: "",
						data: [],
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

					if (serie === "capitalGain") {
						result.label = "Ganho de Capital";
						result.data = filteredData.map(element => element.capitalGain);
						result.borderColor = (ctx) => ctx.raw as number < 0 ? '#e67c73' : '#26A69A';
						result.backgroundColor = (ctx) => ctx.raw as number < 0 ? '#e67c73' : '#26A69A';
						result.datalabels!.align = "start";

					} else if (serie === "charges") {
						result.label = "Encargos";
						result.data = filteredData.map(element => element.charges);
						result.borderColor = '#FFEB3B';
						result.backgroundColor = '#FFEB3B';
						result.datalabels!.align = "end";
					}

					return result;
				})
			}

			this.chartOptions = {
				locale: "pt-BR",
				indexAxis: 'y',
				interaction: {
					mode: 'index',
					axis: 'y'
				},
				responsive: true,
				maintainAspectRatio: true,
				aspectRatio: 1.5,
				plugins: {
					tooltip: {
						mode: 'index',
						intersect: false,
						callbacks: {
							label: (context) => {
								const label = context.dataset.label || '';
								const value = context.parsed.x || 0;
								return `${label}: ${this.currencyPipe.transform(value, 'BRL', 'symbol', '1.2-2')}`;
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
							return `${this.currencyPipe.transform(value, 'BRL', 'symbol', '1.2-2')}`;
						}
					}
				},
				scales: {
					x: {
						stacked: true,
						ticks: {
							callback: (value, index, ticks) => {
								return `${this.currencyPipe.transform(value, 'BRL', 'symbol', '1.2-2')}`;
							},
						}
					},
					y: {
						stacked: true
					}
				}
			};

		} else if (this.dataAnalysisTypesSelected === "Movimentação") {

			if (!this.chartPlugins.includes(ChartDataLabels)) {
				this.chartPlugins.push(ChartDataLabels);
			}

			this.chartType = "bar";

			this.chartData = {
				labels: filteredData
					.map(element => element.monthlyReferenceDate)
					.map(element => format(element, 'MMM/yyyy', { locale: ptBR })),
				datasets: ["movementations"].map(serie => {

					const result: ChartDataset = {
						type: 'bar',
						label: "Movimentações",
						data: filteredData.map(element => element.movementations),
						borderWidth: 1,
						borderColor: (ctx) => ctx.raw as number < 0 ? '#e67c73' : '#26A69A',
						backgroundColor: (ctx) => ctx.raw as number < 0 ? '#e67c73' : '#26A69A',
						datalabels: {
							align: "start",
							font: {
								family: "Montserrat",
								weight: 700,
								size: 10
							}
						}
					};

					return result;
				})
			}

			this.chartOptions = {
				locale: "pt-BR",
				indexAxis: 'y',
				interaction: {
					mode: 'index',
					axis: 'y'
				},
				responsive: true,
				maintainAspectRatio: true,
				aspectRatio: 1.5,
				plugins: {
					tooltip: {
						mode: 'index',
						intersect: false,
						callbacks: {
							label: (context) => {
								const label = context.dataset.label || '';
								const value = context.parsed.x || 0;
								return `${label}: ${this.currencyPipe.transform(value, 'BRL', 'symbol', '1.2-2')}`;
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
							return `${this.currencyPipe.transform(value, 'BRL', 'symbol', '1.2-2')}`;
						}
					}
				},
				scales: {
					x: {
						stacked: true,
						ticks: {
							callback: (value, index, ticks) => {
								return `${this.currencyPipe.transform(value, 'BRL', 'symbol', '1.2-2')}`;
							},
						}
					},
					y: {
						stacked: true
					}
				}
			};

		} else if (this.dataAnalysisTypesSelected === "Patrimônio") {

			if (this.chartPlugins.includes(ChartDataLabels)) {
				this.chartPlugins.splice(this.chartPlugins.indexOf(ChartDataLabels), 1);
			}

			this.chartType = "line";

			this.chartData = {
				labels: filteredData
					.map(element => element.monthlyReferenceDate)
					.map(element => format(element, 'MMM/yyyy', { locale: ptBR }))
					.reverse(),
				datasets: ["valueApplied", "finalEquity"].map(serie => {

					const result: ChartDataset = {
						type: 'line',
						label: "",
						data: [],
						borderWidth: 1,
						borderColor: "",
						backgroundColor: "",
						fill: true,
						pointStyle: false
					};

					if (serie === "valueApplied") {
						result.label = "Valor Investido";
						result.data = filteredData.map(element => element.valueApplied).reverse();
						result.borderColor = "#2196F3";
						result.backgroundColor = "#2196F3";

					} else if (serie === "finalEquity") {
						result.label = "Saldo Bruto";
						result.data = filteredData.map(element => element.finalEquity).reverse();
						result.borderColor = '#673AB7';
						result.backgroundColor = '#673AB7';
					}

					return result;
				})
			}

			this.chartOptions = {
				locale: "pt-BR",
				indexAxis: 'x',
				interaction: {
					mode: 'index',
					axis: 'x'
				},
				responsive: true,
				maintainAspectRatio: true,
				aspectRatio: 2.0,
				plugins: {
					tooltip: {
						mode: 'index',
						intersect: false,
						callbacks: {
							label: (context) => {
								const label = context.dataset.label || '';
								const value = context.parsed.y || 0;
								return `${label}: ${this.currencyPipe.transform(value, 'BRL', 'symbol', '1.2-2')}`;
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
								return `${this.currencyPipe.transform(value, 'BRL', 'symbol', '1.2-2')}`;
							},
						}
					}
				}
			};

		}
	}
}
