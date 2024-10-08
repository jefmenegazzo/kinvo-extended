/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule, CurrencyPipe, PercentPipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ChartData, ChartDataset, ChartOptions, ChartType, Plugin } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { format, lastDayOfMonth, max, min, parse, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { ButtonModule } from "primeng/button";
import { CalendarModule } from "primeng/calendar";
import { ChartModule } from "primeng/chart";
import { DropdownModule } from "primeng/dropdown";
import { SelectButtonModule } from "primeng/selectbutton";
import { SkeletonModule } from "primeng/skeleton";
import { TableModule } from "primeng/table";
import { finalize, forkJoin, tap } from "rxjs";
import { KinvoApiResponse } from "../../dtos/kinvo-api-response";
import { KinvoCapitalGain } from "../../dtos/kinvo-capital-gain";
import { KinvoPortfolio } from "../../dtos/kinvo-portfolio";
import { KinvoPortfolioProduct } from "../../dtos/kinvo-portfolio-product";
import { KinvoPortfolioProfitability } from "../../dtos/kinvo-portfolio-profitability";
import { aggregationKeysFirst, aggregationKeysJurosCompostos, aggregationKeysLast, aggregationKeysPercentRelative, aggregationKeysSum, DataFull } from "../../models/data-full";
import { DataProfitability } from "../../models/data-profitability";
import { KinvoServiceApi } from "../../services/kinvo.service.api";

type DataAnalysisType = "Resumo" | "Rentabilidade" | "Ganho de Capital" | "Movimentação" | "Patrimônio" | "Distribuição";
type DataInterval = "Do Início" | "No Ano" | "No Mês" | "3 Meses" | "6 Meses" | "12 Meses" | "24 Meses" | "36 Meses" | "Personalizado";
type DataAggregator = "Dia" | "Mês" | "Ano" | "Total" | "Estratégia" | "Classe" | "Instituição";

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
		CurrencyPipe,
		PercentPipe
	],
	templateUrl: "./rentabilidade.component.html",
	styleUrl: "./rentabilidade.component.scss"
})
export class RentabilidadeComponent implements OnInit {

	portfolioData: KinvoPortfolio[] = [];
	portfolioDataSelected!: number;
	portfolioDataLoading: boolean = false;

	dataAnalysisTypes: DataAnalysisType[] = ["Resumo", "Rentabilidade", "Ganho de Capital", "Movimentação", "Patrimônio", "Distribuição"];
	dataAnalysisTypesSelected: DataAnalysisType = this.dataAnalysisTypes[0];

	dataIntervalOptions: DataInterval[] = ["Do Início", "No Ano", "No Mês", "3 Meses", "6 Meses", "12 Meses", "24 Meses", "36 Meses", "Personalizado"];
	dataIntervalOptionsSelected: DataInterval = this.dataIntervalOptions[0];
	dateRange: Date[] | undefined = [];

	aggregatorOptions: DataAggregator[] = ["Mês", "Ano"];
	aggregatorOptionsSelected: DataAggregator | undefined = this.aggregatorOptions[0];

	chartType: ChartType | undefined;
	chartData: ChartData | undefined;
	chartOptions: ChartOptions | undefined;
	chartPlugins: Plugin[] = [];
	chartHeight: string = "100%";

	tableData: DataFull[] = [];
	tableDataTotalsRow: DataFull = {} as DataFull;

	monthlyDataFull: DataFull[] = []; // Mensal
	dailyDataProfitability!: DataProfitability[]; // Diário

	dataFullLoading: boolean = false;

	constructor(
		private kinvoServiceApi: KinvoServiceApi,
		private currencyPipe: CurrencyPipe,
		private percentPipe: PercentPipe
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

		const allMonths = this.monthlyDataFull.map(element => element.referenceDate);
		let [minMonth, maxMonth]: [Date | undefined, Date | undefined] = [min(allMonths), max(allMonths)];

		switch (this.dataIntervalOptionsSelected) {
			case this.dataIntervalOptions[0]: // "Do Início":
				minMonth.setDate(1);
				minMonth.setHours(0, 0, 0, 0);
				break;
			case this.dataIntervalOptions[1]: // "No Ano":
				minMonth = new Date();
				minMonth.setMonth(0);
				minMonth.setDate(1);
				minMonth.setHours(0, 0, 0, 0);
				break;
			case this.dataIntervalOptions[2]: // "No Mês":
				minMonth = new Date();
				minMonth.setDate(1);
				minMonth.setHours(0, 0, 0, 0);
				break;
			case this.dataIntervalOptions[3]: // "3 Meses":
				minMonth = new Date();
				minMonth.setMonth(minMonth.getMonth() - 2);
				minMonth.setDate(1);
				minMonth.setHours(0, 0, 0, 0);
				break;
			case this.dataIntervalOptions[4]: // "6 Meses":
				minMonth = new Date();
				minMonth.setMonth(minMonth.getMonth() - 5);
				minMonth.setDate(1);
				minMonth.setHours(0, 0, 0, 0);
				break;
			case this.dataIntervalOptions[5]: // "12 Meses":
				minMonth = new Date();
				minMonth.setMonth(minMonth.getMonth() - 11);
				minMonth.setDate(1);
				minMonth.setHours(0, 0, 0, 0);
				break;
			case this.dataIntervalOptions[6]: // "24 Meses":
				minMonth = new Date();
				minMonth.setMonth(minMonth.getMonth() - 23);
				minMonth.setDate(1);
				minMonth.setHours(0, 0, 0, 0);
				break;
			case this.dataIntervalOptions[7]: // "36 Meses":
				minMonth = new Date();
				minMonth.setMonth(minMonth.getMonth() - 35);
				minMonth.setDate(1);
				minMonth.setHours(0, 0, 0, 0);
				break;
			case this.dataIntervalOptions[8]: // "Personalizado":

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

		switch (this.dataAnalysisTypesSelected) {
			case this.dataAnalysisTypes[0]: // "Resumo"
				this.aggregatorOptions = ["Mês", "Ano"];
				this.aggregatorOptionsSelected = "Mês";
				break;

			case this.dataAnalysisTypes[1]: // "Rentabilidade"
				this.aggregatorOptions = ["Dia", "Mês", "Ano"];
				this.aggregatorOptionsSelected = "Dia";
				break;

			case this.dataAnalysisTypes[2]: // "Ganho de Capital"
				this.aggregatorOptions = ["Mês", "Ano"];
				this.aggregatorOptionsSelected = "Mês";
				break;

			case this.dataAnalysisTypes[3]: // "Movimentação"
				this.aggregatorOptions = ["Mês", "Ano"];
				this.aggregatorOptionsSelected = "Mês";
				break;

			case this.dataAnalysisTypes[4]: // "Patrimônio"
				this.aggregatorOptions = ["Mês", "Ano"];
				this.aggregatorOptionsSelected = "Mês";
				break;

			case this.dataAnalysisTypes[5]: // "Distribuição"
				this.aggregatorOptions = ["Estratégia", "Classe", "Instituição"];
				this.aggregatorOptionsSelected = "Estratégia";
				break;
		}

		this.applyDataFilters();
	}

	onAggregatorChange() {
		this.applyDataFilters();
	}

	loadDataFull() {

		if (this.dataFullLoading) {
			return;
		}

		this.dataFullLoading = true;
		this.tableData = [];
		this.chartData = undefined;

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

	createDataFull(date: string, dateFormat?: string): DataFull {

		return {
			referenceDate: dateFormat ? parse(date, dateFormat, new Date(), { locale: ptBR }) : parseISO(date),
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

	calcPercentOrNA(value: number, total: number): number | undefined {
		return value < 0 || total <= 0 ? undefined : value / total;
	}

	mergeDataFull(capitalGain: KinvoApiResponse<KinvoCapitalGain>, profitability: KinvoApiResponse<KinvoPortfolioProfitability>, products: KinvoApiResponse<KinvoPortfolioProduct[]>) {

		let dataAggregatedByMonth: Record<string, DataFull> = {};

		for (const element of capitalGain.data.capitalGainByProductInTheMonth) {

			if (!dataAggregatedByMonth[element.monthlyReferenceDate]) {
				dataAggregatedByMonth[element.monthlyReferenceDate] = this.createDataFull(element.monthlyReferenceDate);
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

		const capitalGainTableByMonth = Object.values(dataAggregatedByMonth);
		capitalGainTableByMonth.sort((a, b) => b.referenceDate.getTime() - a.referenceDate.getTime());

		dataAggregatedByMonth = {};

		for (const product of products.data) {

			for (const statement of product.statements.data) {

				const referenceDate = parseISO(statement.date);
				referenceDate.setUTCDate(1);
				const monthlyReferenceDate = referenceDate.toISOString();

				if (!dataAggregatedByMonth[monthlyReferenceDate]) {
					dataAggregatedByMonth[monthlyReferenceDate] = this.createDataFull(monthlyReferenceDate);
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

		const productsStatementsByMonth = Object.values(dataAggregatedByMonth);
		productsStatementsByMonth.sort((a, b) => b.referenceDate.getTime() - a.referenceDate.getTime());

		let profitabilityCategories = profitability.data.monthlyProfitabilityToChart.categories;
		let profitabilitySeries = profitability.data.monthlyProfitabilityToChart.series;
		let profitabilityCarteira = profitabilitySeries.find(serie => serie.name === "Carteira")!.data;
		let profitabilityCdi = profitabilitySeries.find(serie => serie.name === "CDI")!.data;
		let profitabilityIbov = profitabilitySeries.find(serie => serie.name === "IBOV")!.data;
		let profitabilityInflacao = profitabilitySeries.find(serie => serie.name === "Inflação (IPCA)")!.data;
		let profitabilityPoupanca = profitabilitySeries.find(serie => serie.name === "Poupança")!.data;

		const profitabilityDataByMonth: DataProfitability[] = [];

		for (let i = 0; i < profitabilityCategories.length; i++) {
			profitabilityDataByMonth.push({
				referenceDate: parse(profitabilityCategories[i] as string, "MMM. yy", new Date(), { locale: ptBR }),
				carteira: profitabilityCarteira[i],
				cdi: profitabilityCdi[i],
				ibov: profitabilityIbov[i],
				inflacao: profitabilityInflacao[i],
				poupanca: profitabilityPoupanca[i]
			});
		}

		const transformPercent = (value: number | undefined): number => {
			return (value || 0) / 100;
		};

		for (const element of capitalGainTableByMonth) {

			const productsStatementsElement = productsStatementsByMonth.find(iterator => iterator.referenceDate.getTime() === element.referenceDate.getTime());
			element.movementations = element.finalEquity - (element.initialEquity + element.capitalGain);
			element.incomeTax = productsStatementsElement?.incomeTax || 0;
			element.iof = productsStatementsElement?.iof || 0;
			element.cost = productsStatementsElement?.cost || 0;
			element.charges = element.incomeTax + element.iof + element.cost;
			element.applications = productsStatementsElement?.applications || 0;
			element.redemptions = productsStatementsElement?.redemptions || 0;
			element.proceeds = productsStatementsElement?.proceeds || 0;

			const profitabilityDataElement = profitabilityDataByMonth.find(iterator => iterator.referenceDate.getTime() === element.referenceDate.getTime());
			element.profitabilityCarteira = transformPercent(profitabilityDataElement?.carteira);
			element.profitabilityCdi = transformPercent(profitabilityDataElement?.cdi);
			element.profitabilityIbov = transformPercent(profitabilityDataElement?.ibov);
			element.profitabilityInflacao = transformPercent(profitabilityDataElement?.inflacao);
			element.profitabilityPoupanca = transformPercent(profitabilityDataElement?.poupanca);

			element.profitabilityCarteiraPercentCdi = this.calcPercentOrNA(element.profitabilityCarteira, element.profitabilityCdi);
			element.profitabilityCarteiraPercentIbov = this.calcPercentOrNA(element.profitabilityCarteira, element.profitabilityIbov);
			element.profitabilityCarteiraPercentInflacao = this.calcPercentOrNA(element.profitabilityCarteira, element.profitabilityInflacao);
			element.profitabilityCarteiraPercentPoupanca = this.calcPercentOrNA(element.profitabilityCarteira, element.profitabilityPoupanca);
		}

		this.monthlyDataFull = capitalGainTableByMonth;

		profitabilityCategories = profitability.data.dailyProfitabilityToChart.categories;
		profitabilitySeries = profitability.data.dailyProfitabilityToChart.series;
		profitabilityCarteira = profitabilitySeries.find(serie => serie.name === "Carteira")!.data;
		profitabilityCdi = profitabilitySeries.find(serie => serie.name === "CDI")!.data;
		profitabilityIbov = profitabilitySeries.find(serie => serie.name === "IBOV")!.data;
		profitabilityInflacao = profitabilitySeries.find(serie => serie.name === "Inflação (IPCA)")!.data;
		profitabilityPoupanca = profitabilitySeries.find(serie => serie.name === "Poupança")!.data;

		this.dailyDataProfitability = [];

		for (let i = 0; i < profitabilityCategories.length; i++) {
			this.dailyDataProfitability.push({
				referenceDate: parseISO(profitabilityCategories[i] as string),
				carteira: profitabilityCarteira[i],
				cdi: profitabilityCdi[i],
				ibov: profitabilityIbov[i],
				inflacao: profitabilityInflacao[i],
				poupanca: profitabilityPoupanca[i]
			});
		}
	}

	downloadTableCSV() {

		const tableColumns: Record<keyof DataFull, string> = {
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

		const csvBody = this.tableData.map(
			row => Object.keys(tableColumns).map(
				column => {

					let value: undefined | string | number | Date = row[column as keyof DataFull];

					if (value instanceof Date) {
						value = format(value, this.aggregatorOptionsSelected == "Ano" ? "yyyy" : "MM/yyyy", { locale: ptBR });

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

	//  M = C * (1 + i) ^ t
	calcularJurosCompostos(percentuais: number[]): number {

		let percentualAcumulado = 1;

		for (const percentual of percentuais) {
			percentualAcumulado *= (1 + percentual);
		}

		return percentualAcumulado - 1;
	}

	adicionarCapitalizacaoComposta(dataProfitabilityByDay: DataProfitability[]) {

		const fields = ["carteira", "cdi", "ibov", "inflacao", "poupanca"] as (keyof Omit<DataProfitability, "referenceDate">)[];
		dataProfitabilityByDay.forEach(element => fields.forEach(field => element[field] /= 100));

		const percentualAcumulado = {
			"carteira": 1,
			"cdi": 1,
			"ibov": 1,
			"inflacao": 1,
			"poupanca": 1
		};

		dataProfitabilityByDay.forEach(element => {
			fields.forEach(field => {
				percentualAcumulado[field] *= (1 + element[field]);
				element[field] = percentualAcumulado[field] - 1;
			});
		});

		dataProfitabilityByDay.forEach(element => fields.forEach(field => element[field] *= 100));
		return dataProfitabilityByDay;
	}

	removerCapitalizacaoComposta(dataProfitabilityByDay: DataProfitability[]) {

		const fields = ["carteira", "cdi", "ibov", "inflacao", "poupanca"] as (keyof Omit<DataProfitability, "referenceDate">)[];

		dataProfitabilityByDay.sort((a, b) => a.referenceDate.getTime() - b.referenceDate.getTime());
		dataProfitabilityByDay.forEach(element => fields.forEach(field => element[field] /= 100));

		for (let i = dataProfitabilityByDay.length - 1; i > 0; i--) {
			for (const field of fields) {
				dataProfitabilityByDay[i][field] = (dataProfitabilityByDay[i][field] + 1) / (dataProfitabilityByDay[i - 1][field] + 1) - 1;
			}
		}

		dataProfitabilityByDay.forEach(element => fields.forEach(field => element[field] *= 100));
		return dataProfitabilityByDay;
	}

	filterDataByDateRange<T extends DataFull | DataProfitability>(data: T[]): T[] {

		return data.map(element => ({ ...element } as T)).filter(element => {

			const date = element.referenceDate;

			if (this.dateRange?.[0] && this.dateRange?.[1]) {
				return date >= this.dateRange[0] && date <= this.dateRange[1];

			} else if (this.dateRange?.[0]) {
				return date >= this.dateRange[0];

			} else if (this.dateRange?.[1]) {
				return date <= this.dateRange[1];
			}

			return false;
		});
	}

	aggregateDataByAggregator<T extends DataFull>(data: T[], aggregator: DataAggregator): T[] {

		const dataAggregated: Record<string, T[]> = {};
		let dateFormat: string = "dd/MM/yyyy";
		data.sort((a, b) => a.referenceDate.getTime() - b.referenceDate.getTime());

		switch (aggregator) {
			case "Ano":
				dateFormat = "yyyy";
				break;
			case "Mês":
				dateFormat = "MM/yyyy";
				break;
			case "Dia":
				dateFormat = "dd/MM/yyyy";;
				break;
			case "Total":
				dateFormat = "";
				break;
		}

		for (const element of data) {

			const date = element.referenceDate;
			const key = dateFormat ? format(date, dateFormat, { locale: ptBR }) : "";

			if (!dataAggregated[key]) {
				dataAggregated[key] = [];
			}

			dataAggregated[key].push(element);
		}

		const dataFiltered = Object.entries(dataAggregated).map(([key, elements]) => {

			// Total
			if (!key) {
				key = new Date().toISOString();
			}

			const row = this.createDataFull(key, dateFormat);
			aggregationKeysFirst.forEach(key => row[key] = elements![0][key]);
			aggregationKeysLast.forEach(key => row[key] = elements![elements!.length - 1][key]);
			aggregationKeysSum.forEach(key => row[key] = elements!.reduce((acc, element) => acc + element[key]!, 0));
			aggregationKeysJurosCompostos.forEach(key => row[key] = this.calcularJurosCompostos(elements.map(element => element[key]!)));
			aggregationKeysPercentRelative.forEach((key, index) => row[key] = this.calcPercentOrNA(row.profitabilityCarteira, row[aggregationKeysJurosCompostos[index]]!));

			return row;
		});

		dataFiltered.sort((a, b) => b.referenceDate.getTime() - a.referenceDate.getTime());
		return dataFiltered as T[];
	}

	applyDataFilters() {

		// Limpeza de Dados

		this.tableData = [];
		this.tableDataTotalsRow = {} as DataFull;

		this.chartType = undefined;
		this.chartData = undefined;
		this.chartOptions = undefined;
		this.chartPlugins.splice(0, this.chartPlugins.length);
		this.chartHeight = "100%";

		// Filtro de Data e Agregação de Datos

		const monthlyDataFiltered = this.aggregateDataByAggregator(
			this.filterDataByDateRange(this.monthlyDataFull), this.aggregatorOptionsSelected!
		);

		const dailyDataProfitabilityFiltered = this.adicionarCapitalizacaoComposta(
			this.filterDataByDateRange(
				this.removerCapitalizacaoComposta(
					this.dailyDataProfitability.map(element => ({ ...element }))
				)
			)
		);

		switch (this.dataAnalysisTypesSelected) {
			case this.dataAnalysisTypes[0]: // "Resumo"
				this.buildViewResumo(monthlyDataFiltered);
				break;

			case this.dataAnalysisTypes[1]: // "Rentabilidade"
				this.buildViewRentabilidade(monthlyDataFiltered, dailyDataProfitabilityFiltered);
				break;

			case this.dataAnalysisTypes[2]: // "Ganho de Capital"
				this.buildViewGanhoCapital(monthlyDataFiltered);
				break;

			case this.dataAnalysisTypes[3]: // "Movimentação"
				this.buildViewMovimentacao(monthlyDataFiltered);
				break;

			case this.dataAnalysisTypes[4]: // "Patrimônio"
				this.buildViewPatrimonio(monthlyDataFiltered);
				break;

			case this.dataAnalysisTypes[5]: // "Distribuição"
				this.buildViewDistribuicao(monthlyDataFiltered);
				break;
		}
	}

	buildViewResumo(monthlyDataFiltered: DataFull[]) {
		this.tableData = [...monthlyDataFiltered];
		this.tableDataTotalsRow = this.aggregateDataByAggregator(this.tableData, "Total")?.[0];
	}

	buildViewRentabilidade(monthlyDataFiltered: DataFull[], dailyDataProfitabilityFiltered: DataProfitability[]) {

		if (this.aggregatorOptionsSelected == "Ano" || this.aggregatorOptionsSelected == "Mês") {

			if (!this.chartPlugins.includes(ChartDataLabels)) {
				this.chartPlugins.push(ChartDataLabels);
			}

			this.chartType = "bar";
			this.chartHeight = 75 + (20 * monthlyDataFiltered.length * 5) + "px"; // TODO mudar tamanho conforme são selecionados as labels

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
						position: "top"
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
						borderWidth: 1,
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
				},
			};
		}
	}

	buildViewGanhoCapital(monthlyDataFiltered: DataFull[]) {

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

	buildViewMovimentacao(monthlyDataFiltered: DataFull[]) {

		this.chartType = "bar";
		this.chartHeight = 75 + (20 * monthlyDataFiltered.length) + "px";

		if (!this.chartPlugins.includes(ChartDataLabels)) {
			this.chartPlugins.push(ChartDataLabels);
		}

		this.chartData = {
			labels: monthlyDataFiltered
				.map(element => element.referenceDate)
				.map(element => format(element, this.aggregatorOptionsSelected == "Ano" ? "yyyy" : "MMM/yyyy", { locale: ptBR })),
			datasets: ["movementations"].map(serie => {

				const result: ChartDataset = {
					type: "bar",
					label: "Movimentações",
					data: monthlyDataFiltered.map(element => element.movementations),
					borderWidth: 1,
					borderColor: (ctx) => ctx.raw as number < 0 ? "#e67c73" : "#26A69A",
					backgroundColor: (ctx) => ctx.raw as number < 0 ? "#e67c73" : "#26A69A",
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

	buildViewPatrimonio(monthlyDataFiltered: DataFull[]) {

		if (this.aggregatorOptionsSelected == "Ano") {

			if (!this.chartPlugins.includes(ChartDataLabels)) {
				this.chartPlugins.push(ChartDataLabels);
			}

			this.chartType = "bar";
			this.chartHeight = 75 + (20 * monthlyDataFiltered.length) + "px";

			this.chartData = {
				labels: monthlyDataFiltered
					.map(element => element.referenceDate)
					.map(element => format(element, this.aggregatorOptionsSelected == "Ano" ? "yyyy" : "MMM/yyyy", { locale: ptBR })),
				datasets: ["valueApplied", "finalEquity"].map(serie => {

					const result: ChartDataset = {
						type: "bar",
						label: "",
						data: monthlyDataFiltered.map(element => element[serie as keyof DataFull]) as number[],
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

			this.chartData = {
				labels: monthlyDataFiltered
					.map(element => element.referenceDate)
					.map(element => format(element, this.aggregatorOptionsSelected == "Ano" ? "yyyy" : "MMM/yyyy", { locale: ptBR }))
					.reverse(),
				datasets: ["valueApplied", "finalEquity"].map(serie => {

					const result: ChartDataset = {
						type: "line",
						label: "",
						data: monthlyDataFiltered.map(element => element[serie as keyof DataFull]).reverse() as number[],
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

	buildViewDistribuicao(monthlyDataFiltered: DataFull[]) {

	}
}
