import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { addDays, format, lastDayOfMonth, parse, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";
import cloneDeep from "lodash/cloneDeep";
import { MenuItem, SelectItem, SelectItemGroup } from "primeng/api";
import { CalendarModule } from "primeng/calendar";
import { DropdownModule } from "primeng/dropdown";
import { TabMenuModule } from "primeng/tabmenu";
import { finalize } from "rxjs";
import { AggregatedDataByDate, aggregationKeysFirst, aggregationKeysJurosCompostos, aggregationKeysLast, aggregationKeysPercentRelative, aggregationKeysSum } from "../../models/aggregated-data-by-date";
import { AggregatedDataByLabel } from "../../models/aggregated-data-by-label";
import { AggregatedProfitabilityByDate, ProfitabilityData } from "../../models/aggregated-profitability-by-date";
import { AssetData } from "../../models/asset-data";
import { GeneralFilterData } from "../../models/general-filter-data";
import { PortfolioData } from "../../models/portfolio-data";
import { KinvoDatabaseService } from "../../services/kinvo-database.service";
import { DistribuicaoComponent } from "./distribuicao/distribuicao.component";
import { GanhoCapitalComponent } from "./ganho-capital/ganho-capital.component";
import { MovimentacaoComponent } from "./movimentacao/movimentacao.component";
import { PatrimonioComponent } from "./patrimonio/patrimonio.component";
import { RentabilidadeComponent } from "./rentabilidade/rentabilidade.component";
import { ResumoComponent } from "./resumo/resumo.component";

export type DataAnalysisType = "Resumo" | "Rentabilidade" | "Ganho de Capital" | "Movimentação" | "Patrimônio" | "Distribuição";
export type DataInterval = "Do Início" | "No Ano" | "No Mês" | "3 Meses" | "6 Meses" | "12 Meses" | "24 Meses" | "36 Meses" | "Personalizado";
export type DataAggregator = "Dia" | "Mês" | "Ano" | "Total" | "Estratégia" | "Classe" | "Instituição";

export const dataAnalysisTypes: DataAnalysisType[] = ["Resumo", "Rentabilidade", "Ganho de Capital", "Movimentação", "Patrimônio", "Distribuição"];
export const dataIntervalOptions: DataInterval[] = ["Do Início", "No Ano", "No Mês", "3 Meses", "6 Meses", "12 Meses", "24 Meses", "36 Meses", "Personalizado"];
export const aggregatorOptions: DataAggregator[] = ["Dia", "Mês", "Ano", "Total", "Estratégia", "Classe", "Instituição"];

@Component({
	selector: "app-analises",
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		DropdownModule,
		CalendarModule,
		TabMenuModule,
		ResumoComponent,
		RentabilidadeComponent,
		PatrimonioComponent,
		MovimentacaoComponent,
		GanhoCapitalComponent,
		DistribuicaoComponent
	],
	providers: [],
	templateUrl: "./analises.component.html",
	styleUrl: "./analises.component.scss"
})
export class AnalisesComponent implements OnInit {

	dataAnalysisTypesMenuItens: MenuItem[] = dataAnalysisTypes.map(element => ({
		label: element,
		command: () => {
			this.dataAnalysisTypesSelected = element as DataAnalysisType;
			this.onDataAnalysisTypeChange();
		}
	} as MenuItem));

	dataAnalysisTypesActiveItem: MenuItem = this.dataAnalysisTypesMenuItens[0];

	dataAnalysisTypes: DataAnalysisType[] = dataAnalysisTypes;
	dataAnalysisTypesSelected: DataAnalysisType = this.dataAnalysisTypes[0];

	portfolioData: PortfolioData[] = [];
	portfolioDataSelected!: number;

	dataIntervalOptions: DataInterval[] = dataIntervalOptions;
	dataIntervalOptionsSelected: DataInterval = this.dataIntervalOptions[0];
	dateRange: Date[] | undefined = [];

	aggregatorOptions: DataAggregator[] = aggregatorOptions;
	aggregatorOptionsSelected: DataAggregator | undefined = this.aggregatorOptions[0];

	generalFilterOptions: SelectItemGroup[] = [];
	generalFilterOptionsSelected!: GeneralFilterData | undefined;

	portfolioDataLoading: boolean = false;
	generalFilterOptionsLoading: boolean = false;
	dataFullLoading: boolean = false;

	get loading(): boolean {
		return this.portfolioDataLoading || this.generalFilterOptionsLoading || this.dataFullLoading;
	}

	firstApplication: Date | undefined;
	financialInstitutionsData: GeneralFilterData[] = [];
	strategiesData: GeneralFilterData[] = [];
	classesData: GeneralFilterData[] = [];
	assetsData: AssetData[] = []; // Ativos
	profitabilityData: ProfitabilityData = {} as ProfitabilityData;

	aggregatedDataByLabel: AggregatedDataByLabel[] = [];
	aggregatedDataByDate: AggregatedDataByDate[] = [];
	aggregatedDataByDateTotals: AggregatedDataByDate = {} as AggregatedDataByDate;
	aggregatedProfitabilityByDate: AggregatedProfitabilityByDate[] = [];

	constructor(
		private kinvoDatabaseService: KinvoDatabaseService,
	) { }

	ngOnInit() {
		this.onDataAnalysisTypeChange();
		this.loadPortfolioData();
	}

	loadPortfolioData() {

		if (this.portfolioDataLoading) {
			return;
		}

		this.portfolioDataLoading = true;

		this.kinvoDatabaseService.loadPortfolios()
			.pipe(
				finalize(() => {
					this.portfolioDataLoading = false;
				})
			)
			.subscribe((data) => {
				this.portfolioData = data;
				this.portfolioDataSelected = this.portfolioData.find(element => element.isPrincipal)!.id;
				this.onPorfolioChange();
			});
	}

	onPorfolioChange() {
		this.aggregatedDataByDate = [];
		this.aggregatedDataByDateTotals = {} as AggregatedDataByDate;
		this.loadGeneralFilterOptions();
		this.loadDataFull();
	}

	loadGeneralFilterOptions() {

		if (this.generalFilterOptionsLoading) {
			return;
		}

		this.generalFilterOptionsLoading = true;
		this.generalFilterOptionsSelected = undefined;

		this.kinvoDatabaseService.loadGeneralFilterOptions(this.portfolioDataSelected)
			.pipe(
				finalize(() => {
					this.generalFilterOptionsLoading = false;
				})
			)
			.subscribe(([firstApplication, financialInstitutions, strategies, classes, assets]) => {

				this.firstApplication = firstApplication as Date;
				this.financialInstitutionsData = financialInstitutions as GeneralFilterData[];
				this.strategiesData = strategies as GeneralFilterData[];
				this.classesData = classes as GeneralFilterData[];

				const mapToSelectItem = (data: GeneralFilterData[]) => data.map(element => ({ label: element.label, value: element } as SelectItem<GeneralFilterData>));

				this.generalFilterOptions = [
					{ label: "Estratégia", items: mapToSelectItem(strategies as GeneralFilterData[]) },
					{ label: "Classe", items: mapToSelectItem(classes as GeneralFilterData[]) },
					{ label: "Instituição", items: mapToSelectItem(financialInstitutions as GeneralFilterData[]) },
					{ label: "Ativo", items: mapToSelectItem(assets as GeneralFilterData[]) },
				];

				this.dataIntervalOptionsSelected = this.dataIntervalOptions[0];
				this.aggregatorOptionsSelected = this.aggregatorOptions[0];
				this.onDataIntervalChange();
			});
	}

	onDataAnalysisTypeChange() {

		switch (this.dataAnalysisTypesSelected) {
			case this.dataAnalysisTypes[0]: // "Resumo"
				this.aggregatorOptions = ["Mês", "Ano"];
				break;

			case this.dataAnalysisTypes[1]: // "Rentabilidade"
				this.aggregatorOptions = ["Dia", "Mês", "Ano"];
				break;

			case this.dataAnalysisTypes[2]: // "Ganho de Capital"
				this.aggregatorOptions = ["Mês", "Ano"];
				break;

			case this.dataAnalysisTypes[3]: // "Movimentação"
				this.aggregatorOptions = ["Mês", "Ano"];
				break;

			case this.dataAnalysisTypes[4]: // "Patrimônio"
				this.aggregatorOptions = ["Mês", "Ano"];
				break;

			case this.dataAnalysisTypes[5]: // "Distribuição"
				this.aggregatorOptions = ["Estratégia", "Classe", "Instituição"];
				this.dataIntervalOptionsSelected = this.dataIntervalOptions[0];
				this.onDataIntervalChange();
				break;
		}

		this.aggregatorOptionsSelected = this.aggregatorOptions[0];
		this.onDataIntervalChange();
	}

	onDataIntervalChange(event?: Date[]) {

		let [minMonth, maxMonth]: [Date | undefined, Date | undefined] = [this.firstApplication || new Date(), new Date()];

		switch (this.dataIntervalOptionsSelected) {
			case this.dataIntervalOptions[0]: // "Do Início":
				minMonth.setDate(1);
				break;
			case this.dataIntervalOptions[1]: // "No Ano":
				minMonth = new Date();
				minMonth.setMonth(0);
				minMonth.setDate(1);
				break;
			case this.dataIntervalOptions[2]: // "No Mês":
				minMonth = new Date();
				minMonth.setDate(1);
				break;
			case this.dataIntervalOptions[3]: // "3 Meses":
				minMonth = new Date();
				minMonth.setMonth(minMonth.getMonth() - 2);
				minMonth.setDate(1);
				break;
			case this.dataIntervalOptions[4]: // "6 Meses":
				minMonth = new Date();
				minMonth.setMonth(minMonth.getMonth() - 5);
				minMonth.setDate(1);
				break;
			case this.dataIntervalOptions[5]: // "12 Meses":
				minMonth = new Date();
				minMonth.setMonth(minMonth.getMonth() - 11);
				minMonth.setDate(1);
				break;
			case this.dataIntervalOptions[6]: // "24 Meses":
				minMonth = new Date();
				minMonth.setMonth(minMonth.getMonth() - 23);
				minMonth.setDate(1);
				break;
			case this.dataIntervalOptions[7]: // "36 Meses":
				minMonth = new Date();
				minMonth.setMonth(minMonth.getMonth() - 35);
				minMonth.setDate(1);
				break;
			case this.dataIntervalOptions[8]: // "Personalizado":

				if (event) {
					minMonth = event![0];
					maxMonth = event![1];
					minMonth.setDate(1);
					break;

				} else {
					this.dateRange = undefined;
					return;
				}
		}

		minMonth.setHours(0, 0, 0, 0);
		const rangeIni = minMonth;
		const rangeEnd = maxMonth ? lastDayOfMonth(maxMonth) : maxMonth;
		this.dateRange = [rangeIni, rangeEnd];

		this.applyDataFilters();
	}

	onAggregatorChange() {
		this.applyDataFilters();
	}

	onGeneralFilterChange() {
		this.applyDataFilters();
	}

	loadDataFull() {

		if (this.dataFullLoading) {
			return;
		}

		this.dataFullLoading = true;
		this.assetsData = [];

		this.kinvoDatabaseService.loadPortfolioData(this.portfolioDataSelected)
			.pipe(
				finalize(() => {
					this.dataFullLoading = false;
				})
			)
			.subscribe(([assetsData, profitability]) => {
				this.assetsData = assetsData as AssetData[];
				this.profitabilityData = profitability as ProfitabilityData;
				this.applyDataFilters();
			});
	}

	applyDataFilters() {

		this.aggregatedDataByLabel = [];
		this.aggregatedDataByDate = [];
		this.aggregatedDataByDateTotals = {} as AggregatedDataByDate;
		this.aggregatedProfitabilityByDate = [];

		let filteredAssetsData = cloneDeep(this.assetsData);

		if (this.generalFilterOptionsSelected) {
			filteredAssetsData = filteredAssetsData.filter(element => element[this.generalFilterOptionsSelected!.field] === this.generalFilterOptionsSelected!.id);
		}

		if (filteredAssetsData.length === 0 || !this.profitabilityData) {
			return;
		}

		if (this.dataAnalysisTypesSelected == this.dataAnalysisTypes[5]) { // "Distribuição"
			this.aggregatedDataByLabel = this.aggregateDataByLabel(filteredAssetsData, this.aggregatorOptionsSelected!);

		} else {

			const dataFullByMonth: AggregatedDataByDate[] = [];

			const getDataFullByMonth = (date: Date) => {

				const referenceDate = new Date(date.getFullYear(), date.getMonth(), 1);
				referenceDate.setHours(0, 0, 0, 0);

				const found = dataFullByMonth.find(element => element.referenceDate.getTime() === referenceDate.getTime());

				if (found) {
					return found;

				} else {
					const element = this.createAggregatedDataByDate(referenceDate);
					dataFullByMonth.push(element);
					return element;
				}
			};

			for (const asset of filteredAssetsData) {

				asset.productStatements = this.filterDataByDateRange(asset.productStatements, "date");
				// asset.dailyEquity = this.filterDataByDateRange(asset.dailyEquity, "date");
				asset.monthlyCapitalGain = this.filterDataByDateRange(asset.monthlyCapitalGain, "referenceDate");

				asset.productStatements.forEach(statement => {
					const element = getDataFullByMonth(statement.date);
					element.incomeTax += statement.incomeTax;
					element.iof += statement.iof;
					element.cost += statement.cost;

					if (statement.movementType === 0) {
						element.proceeds += statement.equity;

					} else if (statement.movementType === 1) {
						element.applications += statement.equity;

					} else if (statement.movementType === 2 || statement.movementType === 3) {
						element.redemptions += statement.equity;
					}

					element.charges = element.incomeTax + element.iof + element.cost;
				});

				asset.monthlyCapitalGain.forEach(capitalGain => {
					const element = getDataFullByMonth(capitalGain.referenceDate);
					element.valueApplied += capitalGain.valueApplied;
					element.initialEquity += capitalGain.initialEquity;
					// element.applications += capitalGain.applications;
					// element.redemptions += capitalGain.redemptions;
					// element.movementations += capitalGain.net; // Não desconta rendimentos de FIIs retirados
					element.returns += capitalGain.returns;
					// element.proceeds += capitalGain.proceeds;
					element.capitalGain += capitalGain.capitalGain;
					element.finalEquity += capitalGain.finalEquity;

					element.movementations = element.finalEquity - (element.initialEquity + element.capitalGain);
				});
			}

			if (!this.generalFilterOptionsSelected) {

				const transformPercent = (value: number | undefined): number => {
					return (value || 0) / 100;
				};

				for (const element of dataFullByMonth) {
					const profitabilityDataElement = this.profitabilityData.monthly.find(iterator => iterator.referenceDate.getTime() === element.referenceDate.getTime());
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
			}

			this.aggregatedDataByDate = this.aggregateDataByDate(dataFullByMonth, this.aggregatorOptionsSelected!);
			this.aggregatedDataByDateTotals = this.aggregateDataByDate(cloneDeep(this.aggregatedDataByDate), "Total")?.[0];

			this.aggregatedProfitabilityByDate = this.adicionarCapitalizacaoComposta(
				this.filterDataByDateRange(
					this.removerCapitalizacaoComposta(
						cloneDeep(this.profitabilityData.daily)
					),
					"referenceDate"
				)
			);
		}
	}

	createAggregatedDataByDate(date: string | Date, dateFormat?: string, partial?: Partial<AggregatedDataByDate>): AggregatedDataByDate {

		const element: AggregatedDataByDate = {
			referenceDate: date instanceof Date
				? date
				: (dateFormat
					? parse(date, dateFormat, new Date(), { locale: ptBR })
					: parseISO(date)
				),
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

		if (partial) {
			Object.assign(element, partial);
		}

		return element;
	}

	filterDataByDateRange<T>(data: T[], dateField: keyof T): T[] {

		return data.map(element => ({ ...element } as T)).filter(element => {

			const date = element[dateField] as Date;

			if (this.dateRange?.[0] && this.dateRange?.[1]) {
				return date >= this.dateRange[0] && date <= this.dateRange[1];

			} else if (this.dateRange?.[0]) {
				return date >= this.dateRange[0];

			} else if (this.dateRange?.[1]) {
				return date <= this.dateRange[1];

			} else {
				return false;
			}
		});
	}

	aggregateDataByDate(data: AggregatedDataByDate[], aggregator: DataAggregator) {

		data.sort((a, b) => a.referenceDate.getTime() - b.referenceDate.getTime()); // ASC

		const dataAggregated: Record<string, AggregatedDataByDate[]> = {};
		let dateFormat: string = "dd/MM/yyyy";

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

		let iniDate = new Date(this.dateRange![0]);
		const endDate = new Date(this.dateRange![1]);
		iniDate.setHours(0, 0, 0, 0);
		endDate.setHours(0, 0, 0, 0);

		// Cria todas as datas entre ini e end
		while (iniDate.getTime() <= endDate.getTime()) {
			const key = dateFormat ? format(iniDate, dateFormat, { locale: ptBR }) : "";
			dataAggregated[key] = [];
			iniDate = addDays(iniDate, 1);
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

			const row = this.createAggregatedDataByDate(key, dateFormat);
			aggregationKeysFirst.forEach(key => row[key] = elements.length > 0 ? elements![0][key] : 0);
			aggregationKeysLast.forEach(key => row[key] = elements.length > 0 ? elements![elements!.length - 1][key] : 0);
			aggregationKeysSum.forEach(key => row[key] = elements!.reduce((acc, element) => acc + element[key]!, 0));
			aggregationKeysJurosCompostos.forEach(key => row[key] = this.calcularJurosCompostos(elements.map(element => element[key]!)));
			aggregationKeysPercentRelative.forEach((key, index) => row[key] = this.calcPercentOrNA(row.profitabilityCarteira, row[aggregationKeysJurosCompostos[index]]!));

			return row;
		});

		dataFiltered.sort((a, b) => b.referenceDate.getTime() - a.referenceDate.getTime()); // DESC
		return dataFiltered;
	}

	//  M = C * (1 + i) ^ t
	calcularJurosCompostos(percentuais: number[]): number {

		let percentualAcumulado = 1;

		for (const percentual of percentuais) {
			percentualAcumulado *= (1 + percentual);
		}

		return percentualAcumulado - 1;
	}

	calcPercentOrNA(value: number, total: number): number | undefined {
		return value < 0 || total <= 0 ? undefined : value / total;
	}

	aggregateDataByLabel(data: AssetData[], aggregator: DataAggregator) {

		let dataAggregated: AggregatedDataByLabel[] = [];
		let aggregatorLabels: GeneralFilterData[] = [];

		switch (aggregator) {
			case "Estratégia":
				aggregatorLabels = this.strategiesData;
				break;
			case "Classe":
				aggregatorLabels = this.classesData;
				break;
			case "Instituição":
				aggregatorLabels = this.financialInstitutionsData;
				break;
		}

		for (const label of aggregatorLabels) {
			dataAggregated.push({
				referenceLabel: label.label,
				finalEquity: data.filter(element => element[label.field] === label.id)
					.reduce((acc, element) => acc + element.equity, 0)
			});
		}

		dataAggregated = dataAggregated.filter(element => element.finalEquity > 0);
		dataAggregated = dataAggregated.sort((a, b) => b.finalEquity - a.finalEquity);
		return dataAggregated;
	}

	adicionarCapitalizacaoComposta(dataProfitabilityByDay: AggregatedProfitabilityByDate[]) {

		const fields = ["carteira", "cdi", "ibov", "inflacao", "poupanca"] as (keyof Omit<AggregatedProfitabilityByDate, "referenceDate">)[];
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

	removerCapitalizacaoComposta(dataProfitabilityByDay: AggregatedProfitabilityByDate[]) {

		const fields = ["carteira", "cdi", "ibov", "inflacao", "poupanca"] as (keyof Omit<AggregatedProfitabilityByDate, "referenceDate">)[];

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
}
