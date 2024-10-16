import { CommonModule } from "@angular/common";
import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { CalendarModule } from "primeng/calendar";
import { DropdownModule } from "primeng/dropdown";
import { finalize } from "rxjs/internal/operators/finalize";
import { AssetData } from "../../../models/asset-data";
import { PortfolioData } from "../../../models/portfolio-data";
import { KinvoDatabaseService } from "../../../services/kinvo-database.service";
import { aggregatorOptions, DataAggregator, DataAnalysisType, dataAnalysisTypes, DataInterval, dataIntervalOptions } from "../analises.constants";
import { lastDayOfMonth } from "date-fns/lastDayOfMonth";

@Component({
	selector: "app-toolbar-filters",
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ButtonModule,
		DropdownModule,
		CalendarModule
	],
	templateUrl: "./toolbar-filters.component.html",
	styleUrl: "./toolbar-filters.component.scss"
})
export class ToolbarFiltersComponent implements OnInit, OnChanges {

	@Input()
	dataAnalysisTypesSelected!: DataAnalysisType;
	dataAnalysisTypes: DataAnalysisType[] = dataAnalysisTypes;

	portfolioData: PortfolioData[] = [];
	portfolioDataSelected!: number;
	portfolioDataLoading: boolean = false;

	dataIntervalOptions: DataInterval[] = dataIntervalOptions;
	dataIntervalOptionsSelected: DataInterval = this.dataIntervalOptions[0];
	dateRange: Date[] | undefined = [];

	aggregatorOptions: DataAggregator[] = aggregatorOptions;
	aggregatorOptionsSelected: DataAggregator | undefined = this.aggregatorOptions[0];

	assetsOptions: AssetData[] = [];
	assetsOptionsSelected!: AssetData;

	dataFullLoading: boolean = false;

	constructor(
		private readonly kinvoDatabaseService: KinvoDatabaseService
	) { }

	ngOnInit() {
		this.loadPortfolioOptions();
	}

	ngOnChanges(changes: SimpleChanges) {

		if (changes["dataAnalysisTypesSelected"]) {
			this.onDataAnalysisTypeChange();
		}
	}

	loadPortfolioOptions() {

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
		this.loadDataFull();
	}

	onDataIntervalChange(event?: Date[]) {

		// const allMonths = this.monthlyDataFull.map(element => element.referenceDate);
		// let [minMonth, maxMonth]: [Date | undefined, Date | undefined] = [min(allMonths), max(allMonths)];

		// switch (this.dataIntervalOptionsSelected) {
		// 	case this.dataIntervalOptions[0]: // "Do Início":
		// 		minMonth.setDate(1);
		// 		minMonth.setHours(0, 0, 0, 0);
		// 		break;
		// 	case this.dataIntervalOptions[1]: // "No Ano":
		// 		minMonth = new Date();
		// 		minMonth.setMonth(0);
		// 		minMonth.setDate(1);
		// 		minMonth.setHours(0, 0, 0, 0);
		// 		break;
		// 	case this.dataIntervalOptions[2]: // "No Mês":
		// 		minMonth = new Date();
		// 		minMonth.setDate(1);
		// 		minMonth.setHours(0, 0, 0, 0);
		// 		break;
		// 	case this.dataIntervalOptions[3]: // "3 Meses":
		// 		minMonth = new Date();
		// 		minMonth.setMonth(minMonth.getMonth() - 2);
		// 		minMonth.setDate(1);
		// 		minMonth.setHours(0, 0, 0, 0);
		// 		break;
		// 	case this.dataIntervalOptions[4]: // "6 Meses":
		// 		minMonth = new Date();
		// 		minMonth.setMonth(minMonth.getMonth() - 5);
		// 		minMonth.setDate(1);
		// 		minMonth.setHours(0, 0, 0, 0);
		// 		break;
		// 	case this.dataIntervalOptions[5]: // "12 Meses":
		// 		minMonth = new Date();
		// 		minMonth.setMonth(minMonth.getMonth() - 11);
		// 		minMonth.setDate(1);
		// 		minMonth.setHours(0, 0, 0, 0);
		// 		break;
		// 	case this.dataIntervalOptions[6]: // "24 Meses":
		// 		minMonth = new Date();
		// 		minMonth.setMonth(minMonth.getMonth() - 23);
		// 		minMonth.setDate(1);
		// 		minMonth.setHours(0, 0, 0, 0);
		// 		break;
		// 	case this.dataIntervalOptions[7]: // "36 Meses":
		// 		minMonth = new Date();
		// 		minMonth.setMonth(minMonth.getMonth() - 35);
		// 		minMonth.setDate(1);
		// 		minMonth.setHours(0, 0, 0, 0);
		// 		break;
		// 	case this.dataIntervalOptions[8]: // "Personalizado":

		// 		if (event) {
		// 			minMonth = event![0];
		// 			maxMonth = event![1];
		// 			minMonth.setDate(1);
		// 			minMonth.setHours(0, 0, 0, 0);
		// 			break;

		// 		} else {
		// 			this.dateRange = undefined;
		// 			return;
		// 		}
		// }

		// const rangeIni = minMonth;
		// const rangeEnd = maxMonth ? lastDayOfMonth(maxMonth) : maxMonth;
		// this.dateRange = [rangeIni, rangeEnd];

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

	onAssetChange() {
		this.applyDataFilters();
	}

	loadDataFull() {

	}

	applyDataFilters() {

	}
}
