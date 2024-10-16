// import { CommonModule } from "@angular/common";
// import { Component, OnInit } from "@angular/core";
// import { TabViewChangeEvent, TabViewModule } from "primeng/tabview";
// import { DataAnalysisType, dataAnalysisTypes } from "./analises.constants";
// import { DistribuicaoComponent } from "./distribuicao/distribuicao.component";
// import { GanhoCapitalComponent } from "./ganho-capital/ganho-capital.component";
// import { MovimentacaoComponent } from "./movimentacao/movimentacao.component";
// import { PatrimonioComponent } from "./patrimonio/patrimonio.component";
// import { RentabilidadeComponent } from "./rentabilidade/rentabilidade.component";
// import { ResumoComponent } from "./resumo/resumo.component";
// import { ToolbarFiltersComponent } from "./toolbar-filters/toolbar-filters.component";

// @Component({
// 	selector: "app-analises",
// 	standalone: true,
// 	imports: [
// 		CommonModule,
// 		TabViewModule,
// 		ToolbarFiltersComponent,
// 		ResumoComponent,
// 		DistribuicaoComponent,
// 		GanhoCapitalComponent,
// 		MovimentacaoComponent,
// 		PatrimonioComponent,
// 		RentabilidadeComponent,
// 	],
// 	templateUrl: "./analises.component.html",
// 	styleUrl: "./analises.component.scss"
// })
// export class AnalisesComponent implements OnInit {

// 	dataAnalysisTypes: DataAnalysisType[] = dataAnalysisTypes;
// 	dataAnalysisTypesSelected!: DataAnalysisType;

// 	ngOnInit() {
// 		this.onDataAnalysisTypeChange({ index: 0, originalEvent: new PointerEvent("") });
// 	}

// 	onDataAnalysisTypeChange(event: TabViewChangeEvent) {
// 		this.dataAnalysisTypesSelected = this.dataAnalysisTypes[event.index];
// 	}
// }

/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { CommonModule, CurrencyPipe, PercentPipe } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { format, lastDayOfMonth, max, min, parse, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import { MenuItem } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CalendarModule } from "primeng/calendar";
import { ChartModule } from "primeng/chart";
import { DropdownModule } from "primeng/dropdown";
import { SelectButtonModule } from "primeng/selectbutton";
import { SkeletonModule } from "primeng/skeleton";
import { TableModule } from "primeng/table";
import { TabMenuModule } from "primeng/tabmenu";
import { finalize, forkJoin, tap } from "rxjs";
import { KinvoApiResponse } from "../../dtos/kinvo-api-response";
import { KinvoCapitalGain } from "../../dtos/kinvo-capital-gain";
import { KinvoConsolidationPortfolioAsset } from "../../dtos/kinvo-consolidation-portfolio-asset";
import { KinvoPortfolio } from "../../dtos/kinvo-portfolio";
import { KinvoPortfolioProduct } from "../../dtos/kinvo-portfolio-product";
import { KinvoPortfolioProfitability } from "../../dtos/kinvo-portfolio-profitability";
import { DataConsolidateAsset } from "../../models/data-consolidate-asset";
import { aggregationKeysFirst, aggregationKeysJurosCompostos, aggregationKeysLast, aggregationKeysPercentRelative, aggregationKeysSum, DataFull } from "../../models/data-full";
import { DataProfitability } from "../../models/data-profitability";
import { KinvoServiceApi } from "../../services/kinvo.service.api";
import { DistribuicaoComponent } from "./distribuicao/distribuicao.component";
import { GanhoCapitalComponent } from "./ganho-capital/ganho-capital.component";
import { MovimentacaoComponent } from "./movimentacao/movimentacao.component";
import { PatrimonioComponent } from "./patrimonio/patrimonio.component";
import { RentabilidadeComponent } from "./rentabilidade/rentabilidade.component";
import { ResumoComponent } from "./resumo/resumo.component";

type DataAnalysisType = "Resumo" | "Rentabilidade" | "Ganho de Capital" | "Movimentação" | "Patrimônio" | "Distribuição";
type DataInterval = "Do Início" | "No Ano" | "No Mês" | "3 Meses" | "6 Meses" | "12 Meses" | "24 Meses" | "36 Meses" | "Personalizado";
type DataAggregator = "Dia" | "Mês" | "Ano" | "Total" | "Estratégia" | "Classe" | "Instituição";

@Component({
	selector: "app-analises",
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
		SkeletonModule,
		TabMenuModule,
		ResumoComponent,
		RentabilidadeComponent,
		PatrimonioComponent,
		MovimentacaoComponent,
		GanhoCapitalComponent,
		DistribuicaoComponent
	],
	providers: [
		KinvoServiceApi,
		CurrencyPipe,
		PercentPipe
	],
	templateUrl: "./analises.component.html",
	styleUrl: "./analises.component.scss"
})
export class AnalisesComponent implements OnInit {

	dataAnalysisTypes: DataAnalysisType[] = ["Resumo", "Rentabilidade", "Ganho de Capital", "Movimentação", "Patrimônio", "Distribuição"];
	dataAnalysisTypesSelected: DataAnalysisType = this.dataAnalysisTypes[0];

	dataAnalysisTypesMenuItens: MenuItem[] = this.dataAnalysisTypes.map((element, index) => ({
		label: element,
		command: () => {
			this.dataAnalysisTypesSelected = element as DataAnalysisType;
			this.onDataAnalysisTypeChange();
		}
	} as MenuItem));

	dataAnalysisTypesActiveItem: MenuItem = this.dataAnalysisTypesMenuItens[0];

	portfolioData: KinvoPortfolio[] = [];
	portfolioDataSelected!: number;
	portfolioDataLoading: boolean = false;

	dataIntervalOptions: DataInterval[] = ["Do Início", "No Ano", "No Mês", "3 Meses", "6 Meses", "12 Meses", "24 Meses", "36 Meses", "Personalizado"];
	dataIntervalOptionsSelected: DataInterval = this.dataIntervalOptions[0];
	dateRange: Date[] | undefined = [];

	aggregatorOptions: DataAggregator[] = ["Mês", "Ano"];
	aggregatorOptionsSelected: DataAggregator | undefined = this.aggregatorOptions[0];

	monthlyDataFull: DataFull[] = []; // Mensal
	dailyDataProfitability!: DataProfitability[]; // Diário
	consolidatedAssets: DataConsolidateAsset[] = []; // Tudo

	dataFullLoading: boolean = false;

	consolidatedAssetsFiltered: Partial<DataConsolidateAsset>[] = [];
	monthlyDataFiltered: DataFull[] = [];
	dailyDataProfitabilityFiltered: DataProfitability[] = [];

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
				this.dataIntervalOptionsSelected = this.dataIntervalOptions[0];
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
		// this.tableData = [];
		// this.chartData = undefined;

		this.kinvoServiceApi.consolidatePortfolio(this.portfolioDataSelected)
			.subscribe(() => {

				forkJoin([
					this.kinvoServiceApi.getCapitalGainByPortfolio(this.portfolioDataSelected),
					this.kinvoServiceApi.getPeriodicPortfolioProfitability(this.portfolioDataSelected),
					this.kinvoServiceApi.getPortfolioProductByPortfolio(this.portfolioDataSelected),
					this.kinvoServiceApi.getConsolidatedPortfolioAssets(this.portfolioDataSelected)
				]).subscribe(([capitalGain, profitability, products, consolidateAssets]) => {

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

						if (capitalGain.success && profitability.success && products.success && consolidateAssets.success) {
							this.mergeDataFull(capitalGain, profitability, products, consolidateAssets);
							this.onDataIntervalChange();
						}
					});
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

	mergeDataFull(capitalGain: KinvoApiResponse<KinvoCapitalGain>, profitability: KinvoApiResponse<KinvoPortfolioProfitability>, products: KinvoApiResponse<KinvoPortfolioProduct[]>, consolidateAssets: KinvoApiResponse<KinvoConsolidationPortfolioAsset[]>) {

		let dataAggregatedByMonth: Record<string, DataFull> = {};

		for (const element of capitalGain.data.capitalGainByProductInTheMonth) {

			if (!dataAggregatedByMonth[element.monthlyReferenceDate]) {
				dataAggregatedByMonth[element.monthlyReferenceDate] = this.createDataFull(element.monthlyReferenceDate);
			}

			const tableRow = dataAggregatedByMonth[element.monthlyReferenceDate];
			tableRow.valueApplied += element.valueApplied;
			tableRow.initialEquity += element.initialEquity;
			// tableRow.applications += element.applications;
			// tableRow.redemptions += element.redemptions;
			tableRow.returns += element.returns;
			// tableRow.proceeds += element.proceeds;
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

		const mapProductTypeIdToProductTypeName: Record<number, string> = {
			1: "Fundo",
			2: "Previdência",
			3: "Renda Fixa Pós-Fixada",
			4: "Tesouro Direto",
			5: "Poupança",
			6: "Renda Fixa Pré-Fixada",
			7: "Criptomoeda",
			8: "Ação",
			9: "Debênture",
			10: "Moeda",
			11: "FII",
			12: "BDR",
			14: "Conta Corrente",
			15: "COE",
			97: "Produto de Posição",
			98: "Renda Fixa Customizada",
			99: "Produto Personalizado"
		};

		this.consolidatedAssets = consolidateAssets.data.map(element => ({
			productId: element.productId,
			productName: element.productName,
			equity: element.equity,
			productTypeId: element.productTypeId,
			productTypeName: mapProductTypeIdToProductTypeName[element.productTypeId],
			financialInstitutionId: element.financialInstitutionId,
			financialInstitutionName: element.financialInstitutionName,
			strategyOfDiversificationId: element.strategyOfDiversificationId,
			strategyOfDiversificationDescription: element.strategyOfDiversificationDescription,
			portfolioPercentage: element.portfolioPercentage
		}));
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
				dataProfitabilityByDay[i][field] = (1 + dataProfitabilityByDay[i][field]) / (1 + dataProfitabilityByDay[i - 1][field]) - 1;
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

	aggregateDataByAggregator(data: DataFull[], aggregator: DataAggregator) {

		const dataAggregated: Record<string, DataFull[]> = {};
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
		return dataFiltered;
	}

	groupAssetsByAggregator(assets: DataConsolidateAsset[], aggregator: DataAggregator) {

		const toTitleCase = (str: string) => {
			return str.toLowerCase().split(" ").map((word: string) => {
				return (word.charAt(0).toUpperCase() + word.slice(1));
			}).join(" ");
		};

		const assetsGrouped: Record<number, Partial<DataConsolidateAsset>> = {};

		for (const element of assets) {

			let key: number;
			const obj: Partial<DataConsolidateAsset> = { equity: 0 };

			switch (aggregator) {
				case "Estratégia":
					key = element.strategyOfDiversificationId;
					obj.strategyOfDiversificationId = element.strategyOfDiversificationId;
					obj.strategyOfDiversificationDescription = toTitleCase(element.strategyOfDiversificationDescription);
					break;

				case "Classe":
					key = element.productTypeId;
					obj.productTypeId = element.productTypeId;
					obj.productTypeName = toTitleCase(element.productTypeName);
					break;

				case "Instituição":
					key = element.financialInstitutionId;
					obj.financialInstitutionId = element.financialInstitutionId;
					obj.financialInstitutionName = toTitleCase(element.financialInstitutionName);
					break;

				default:
					continue;
			}

			if (!assetsGrouped[key]) {
				assetsGrouped[key] = obj;
			}

			assetsGrouped[key].equity! += element.equity;
		}

		return Object.values(assetsGrouped).filter(element => (element?.equity || 0) > 0);
	}

	applyDataFilters() {

		// Filtro de Data e Agregação de Datos

		const monthlyDataFiltered = this.dataAnalysisTypesSelected != this.dataAnalysisTypes[5]
			? this.aggregateDataByAggregator(
				this.filterDataByDateRange(this.monthlyDataFull), this.aggregatorOptionsSelected!
			)
			: [];

		const dailyDataProfitabilityFiltered = this.dataAnalysisTypesSelected == this.dataAnalysisTypes[1]
			? this.adicionarCapitalizacaoComposta(
				this.filterDataByDateRange(
					this.removerCapitalizacaoComposta(
						this.dailyDataProfitability.map(element => ({ ...element }))
					)
				)
			)
			: [];

		const consolidatedAssetsFiltered = this.dataAnalysisTypesSelected == this.dataAnalysisTypes[5]
			? this.groupAssetsByAggregator(this.consolidatedAssets, this.aggregatorOptionsSelected!)
			: [];

		this.monthlyDataFiltered = monthlyDataFiltered;
		this.dailyDataProfitabilityFiltered = dailyDataProfitabilityFiltered;
		this.consolidatedAssetsFiltered = consolidatedAssetsFiltered;
	}
}
