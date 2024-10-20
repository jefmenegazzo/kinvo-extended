import { HttpClient } from "@angular/common/http";
import { Injectable, isDevMode } from "@angular/core";
import { retry } from "rxjs/internal/operators/retry";
import { tap } from "rxjs/internal/operators/tap";
import { KinvoApiResponse } from "../dtos/kinvo-api-response";
import { KinvoCapitalGain } from "../dtos/kinvo-capital-gain";
import { KinvoConsolidation } from "../dtos/kinvo-consolidation";
import { KinvoConsolidationInProgress } from "../dtos/kinvo-consolidation-in-progress";
import { KinvoConsolidationPortfolioAsset } from "../dtos/kinvo-consolidation-portfolio-asset";
import { KinvoFinancialInstitution } from "../dtos/kinvo-finantial-institution";
import { KinvoFundDailyEquity } from "../dtos/kinvo-fund-daily-equity";
import { KinvoFundSnapshot } from "../dtos/kinvo-fund-snapshot";
import { KinvoGenerateNewToken } from "../dtos/kinvo-generate-new-token";
import { KinvoLogin } from "../dtos/kinvo-login";
import { KinvoPortfolio } from "../dtos/kinvo-portfolio";
import { KinvoPortfolioGoalStatus } from "../dtos/kinvo-portfolio-goal-status";
import { KinvoPortfolioProduct } from "../dtos/kinvo-portfolio-product";
import { KinvoPortfolioProductStatement } from "../dtos/kinvo-portfolio-product-statement";
import { KinvoPortfolioProfitability } from "../dtos/kinvo-portfolio-profitability";
import { StoragePayload } from "../models/storage-payload";
import { CacheService, KINVO_KEYS } from "./cache.service";
import { SessionService } from "./session.service";

@Injectable({
	providedIn: "root",
})
export class KinvoServiceApi {

	urlBase = isDevMode()
		? "kinvo/"
		: "https://kinvo-extended-proxy.jef-menegazzo.workers.dev/https://k2c-api.kinvo.com.br/";

	constructor(
		private readonly http: HttpClient,
		private readonly cacheService: CacheService,
		private readonly sessionService: SessionService
	) { }

	private cacheResponse<T>(key: string, response: KinvoApiResponse<T>) {
		if (response.success) {
			this.cacheService.set(key, response);
		}
	}

	public login(user?: string, password?: string, remember?: boolean) {

		if (!user) {
			user = this.cacheService.get(KINVO_KEYS.USER);
		}

		if (!password) {
			password = this.cacheService.get(KINVO_KEYS.PASSWORD);
		}

		const jsonData = {
			email: user,
			password: password,
		};

		return this.http.post<KinvoApiResponse<KinvoLogin>>
			(`${this.urlBase}v4/auth/login`, jsonData) // 'v3/auth/login'
			.pipe(
				tap(async (response) => {

					if (response.success) {

						const data = response.data;
						this.cacheService.set(KINVO_KEYS.USER, user);
						this.cacheService.set(KINVO_KEYS.PASSWORD, password);
						this.cacheService.set(KINVO_KEYS.TOKEN, data.accessToken);
						this.cacheService.set(KINVO_KEYS.REFRESH_TOKEN, data.refreshToken);

						if (remember) {
							const key = await this.sessionService.generateAndStoreCryptoKey();
							const data: StoragePayload = { user: user!, password: password! };
							await this.sessionService.encryptAndStoreData(key, data);
						}
					}
				})
			);
	}

	public generateNewToken() {

		return this.http.get<KinvoApiResponse<KinvoGenerateNewToken>>
			(`${this.urlBase}portfolio-command/user/generateNewToken`)
			.pipe(
				retry(3),
				tap(response => {
					if (response.success) {
						const data = response.data;
						this.cacheService.set(KINVO_KEYS.TOKEN, data.token);
					}
				})
			);
	}

	public consolidatePortfolio(id: number, ignoreCache: boolean = true) {

		const key = `KinvoServiceApi.consolidatePortfolio-${id}`;

		const jsonData = {
			portfolioId: id,
			ignoreCache: true
		};

		return this.cacheService.has(key) && ignoreCache === false
			? this.cacheService.getObservable<KinvoApiResponse<KinvoConsolidation>>(key)
			: this.http.post<KinvoApiResponse<KinvoConsolidation>>
				(`${this.urlBase}portfolio-command/consolidate`, jsonData)
				.pipe(
					retry(3),
					tap(response => this.cacheResponse(key, response))
				);
	}

	public isPortfolioConsolidationInProgress(id: number, ignoreCache: boolean = true) {

		const key = `KinvoServiceApi.isPortfolioConsolidationInProgress-${id}`;

		return this.cacheService.has(key) && ignoreCache === false
			? this.cacheService.getObservable<KinvoApiResponse<KinvoConsolidationInProgress>>(key)
			: this.http.get<KinvoApiResponse<KinvoConsolidationInProgress>>
				(`${this.urlBase}portfolio-command/portfolioConsolidator/IsPortfolioConsolidationInProgress/${id}`)
				.pipe(
					retry(3),
					tap(response => this.cacheResponse(key, response))
				);
	}

	public consolidateFundsByPortfolio(id: number, ignoreCache: boolean = true) {

		const key = `KinvoServiceApi.consolidateFundsByPortfolio-${id}`;

		return this.cacheService.has(key) && ignoreCache === false
			? this.cacheService.getObservable<KinvoApiResponse<KinvoConsolidation>>(key)
			: this.http.post<KinvoApiResponse<KinvoConsolidation>>
				(`${this.urlBase}portfolio/assetClassFundConsolidator/consolidate/${id}`, {})
				.pipe(
					retry(3),
					tap(response => this.cacheResponse(key, response))
				);
	}

	public getPortfolios() {

		const key = `KinvoServiceApi.getPortfolios`;

		return this.cacheService.has(key)
			? this.cacheService.getObservable<KinvoApiResponse<KinvoPortfolio[]>>(key)
			: this.http.get<KinvoApiResponse<KinvoPortfolio[]>>
				(`${this.urlBase}portfolio-command/portfolio/getPortfolios`)
				.pipe(
					retry(3),
					tap(response => this.cacheResponse(key, response))
				);
	}

	public getFinancialInstitutions() {

		const key = `KinvoServiceApi.getFinancialInstitutions`;

		return this.cacheService.has(key)
			? this.cacheService.getObservable<KinvoApiResponse<KinvoFinancialInstitution[]>>(key)
			: this.http.get<KinvoApiResponse<KinvoFinancialInstitution[]>>
				(`${this.urlBase}portfolio-command/FinancialInstitution/GetAll/`)
				.pipe(
					retry(3),
					tap(response => this.cacheResponse(key, response))
				);
	}

	public getPeriodicPortfolioProfitability(id: number, period: number = 1) {

		const key = `KinvoServiceApi.getPeriodicPortfolioProfitability-${id}-${period}`;

		return this.cacheService.has(key)
			? this.cacheService.getObservable<KinvoApiResponse<KinvoPortfolioProfitability>>(key)
			: this.http.get<KinvoApiResponse<KinvoPortfolioProfitability>>
				(`${this.urlBase}portfolio-query/PortfolioAnalysis/GetPeriodicPortfolioProfitability/${id}/${period}`)
				.pipe(
					retry(3),
					tap(response => this.cacheResponse(key, response))
				);
	}

	public getCapitalGainByPortfolio(id: number) {

		const key = `KinvoServiceApi.getCapitalGainByPortfolio-${id}`;

		return this.cacheService.has(key)
			? this.cacheService.getObservable<KinvoApiResponse<KinvoCapitalGain>>(key)
			: this.http.get<KinvoApiResponse<KinvoCapitalGain>>
				(`${this.urlBase}capital-gain/by-portfolio/${id}`)
				.pipe(
					retry(3),
					tap(response => this.cacheResponse(key, response))
				);
	}

	public getPortfolioGoalStatusByPortfolio(id: number) {

		const key = `KinvoServiceApi.getPortfolioGoalStatusByPortfolio-${id}`;

		return this.cacheService.has(key)
			? this.cacheService.getObservable<KinvoApiResponse<KinvoPortfolioGoalStatus>>(key)
			: this.http.get<KinvoApiResponse<KinvoPortfolioGoalStatus>>
				(`${this.urlBase}simpleEquityGoal/getPortfolioGoalStatus/${id}`)
				.pipe(
					retry(3),
					tap(response => this.cacheResponse(key, response))
				);
	}

	public getPortfolioProductByPortfolio(id: number) {

		const key = `KinvoServiceApi.getPortfolioProductByPortfolio-${id}`;

		// Similar ao https://k2c-api.kinvo.com.br/v2/consolidation/portfolios/1240278/assets mas este não traz equity e mais
		return this.cacheService.has(key)
			? this.cacheService.getObservable<KinvoApiResponse<KinvoPortfolioProduct[]>>(key)
			: this.http.get<KinvoApiResponse<KinvoPortfolioProduct[]>>
				(`${this.urlBase}portfolio-command/portfolioProduct/GetByPortfolio/${id}`)
				.pipe(
					retry(3),
					tap(response => this.cacheResponse(key, response))
				);
	}

	public getProductStatementByProduct(id: number) {

		const key = `KinvoServiceApi.getProductStatementByProduct-${id}`;

		// Similar ao https://k2c-api.kinvo.com.br/V2/consolidation/assets/44755657/statement mas este outro não traz iof e ir
		return this.cacheService.has(key)
			? this.cacheService.getObservable<KinvoApiResponse<KinvoPortfolioProductStatement[]>>(key)
			: this.http.get<KinvoApiResponse<KinvoPortfolioProductStatement[]>>
				(`${this.urlBase}portfolio-query/Statement/getProductStatement/${id}`)
				.pipe(
					retry(3),
					tap(response => this.cacheResponse(key, response))
				);
	}

	public getConsolidatedPortfolioAssets(id: number) {

		const key = `KinvoServiceApi.getConsolidationPortfolioAssets-${id}`;

		return this.cacheService.has(key)
			? this.cacheService.getObservable<KinvoApiResponse<KinvoConsolidationPortfolioAsset[]>>(key)
			: this.http.get<KinvoApiResponse<KinvoConsolidationPortfolioAsset[]>>
				(`${this.urlBase}v2/consolidation/portfolios/${id}/assets`)
				.pipe(
					retry(3),
					tap(response => this.cacheResponse(key, response))
				);
	}

	public getFundsDailyEquityByPortfolio(id: number) {

		const key = `KinvoServiceApi.getAssetClassFundDailyEquityByPortfolio-${id}`;

		return this.cacheService.has(key)
			? this.cacheService.getObservable<KinvoApiResponse<KinvoFundDailyEquity[]>>(key)
			: this.http.get<KinvoApiResponse<KinvoFundDailyEquity[]>>
				(`${this.urlBase}portfolio-query/AssetClassFundConsolidation/GetDailyEquityByPortfolio/${id}`)
				.pipe(
					retry(3),
					tap(response => this.cacheResponse(key, response))
				);
	}

	public getFundsSnapshotByPortfolio(id: number) {

		const key = `KinvoServiceApi.getFundsSnapshotByPortfolio-${id}`;

		return this.cacheService.has(key)
			? this.cacheService.getObservable<KinvoApiResponse<KinvoFundSnapshot[]>>(key)
			: this.http.get<KinvoApiResponse<KinvoFundSnapshot[]>>
				(`${this.urlBase}portfolio-query/AssetClassFundConsolidation/GetSnapshotByProduct/${id}`)
				.pipe(
					retry(3),
					tap(response => this.cacheResponse(key, response))
				);
	}
}
