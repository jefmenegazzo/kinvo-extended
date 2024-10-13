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

	public login(user: string, password: string, remember: boolean) {

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
							const data: StoragePayload = { user: user, password: password };
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

	public consolidatePortfolio(id: number) {

		const key = `consolidatePortfolio-${id}`;

		const jsonData = {
			portfolioId: id,
			ignoreCache: true
		};

		return this.http.post<KinvoApiResponse<KinvoConsolidation>>
			(`${this.urlBase}portfolio-command/consolidate`, jsonData)
			.pipe(
				retry(3),
				tap(response => this.cacheResponse(key, response))
			);
	}

	public isPortfolioConsolidationInProgress(id: number) {
		return this.http.get<KinvoApiResponse<KinvoConsolidationInProgress>>
			(`${this.urlBase}portfolio-command/portfolioConsolidator/IsPortfolioConsolidationInProgress/${id}`);
	}

	public consolidateFundsByPortfolio(id: number) {

		return this.http.post<KinvoApiResponse<KinvoConsolidation>>
			(`${this.urlBase}portfolio/assetClassFundConsolidator/consolidate/${id}`, {})
			.pipe(
				retry(3)
			);
	}

	public getPortfolios() {

		const key = "getPortfolios";

		if (this.cacheService.get(key)) {
			return this.cacheService.getObservable<KinvoApiResponse<KinvoPortfolio[]>>(key);
		}

		return this.http.get<KinvoApiResponse<KinvoPortfolio[]>>
			(`${this.urlBase}portfolio-command/portfolio/getPortfolios`)
			.pipe(
				retry(3),
				tap(response => this.cacheResponse(key, response))
			);
	}

	public getFinancialInstitutions() {

		const key = "getFinancialInstitutions";

		if (this.cacheService.get(key)) {
			return this.cacheService.getObservable<KinvoApiResponse<KinvoFinancialInstitution[]>>(key);
		}

		return this.http.get<KinvoApiResponse<KinvoFinancialInstitution[]>>
			(`${this.urlBase}portfolio-command/FinancialInstitution/GetAll/`)
			.pipe(
				retry(3),
				tap(response => this.cacheResponse(key, response))
			);
	}

	public getPeriodicPortfolioProfitability(id: number, period: number = 1) {

		const key = `getPeriodicPortfolioProfitability-${id}-${period}`;

		if (this.cacheService.get(key)) {
			return this.cacheService.getObservable<KinvoApiResponse<KinvoPortfolioProfitability>>(key);
		}

		return this.http.get<KinvoApiResponse<KinvoPortfolioProfitability>>
			(`${this.urlBase}portfolio-query/PortfolioAnalysis/GetPeriodicPortfolioProfitability/${id}/${period}`)
			.pipe(
				retry(3),
				tap(response => this.cacheResponse(key, response))
			);
	}

	public getCapitalGainByPortfolio(id: number) {

		const key = `getCapitalGainByPortfolio-${id}`;

		if (this.cacheService.get(key)) {
			return this.cacheService.getObservable<KinvoApiResponse<KinvoCapitalGain>>(key);
		}

		return this.http.get<KinvoApiResponse<KinvoCapitalGain>>
			(`${this.urlBase}capital-gain/by-portfolio/${id}`)
			.pipe(
				retry(3),
				tap(response => this.cacheResponse(key, response))
			);
	}

	public getPortfolioGoalStatusByPortfolio(id: number) {

		const key = `getPortfolioGoalStatusByPortfolio-${id}`;

		if (this.cacheService.get(key)) {
			return this.cacheService.getObservable<KinvoApiResponse<KinvoPortfolioGoalStatus>>(key);
		}

		return this.http.get<KinvoApiResponse<KinvoPortfolioGoalStatus>>
			(`${this.urlBase}simpleEquityGoal/getPortfolioGoalStatus/${id}`)
			.pipe(
				retry(3),
				tap(response => this.cacheResponse(key, response))
			);
	}

	public getPortfolioProductByPortfolio(id: number) {

		const key = `getPortfolioProductByPortfolio-${id}`;

		if (this.cacheService.get(key)) {
			return this.cacheService.getObservable<KinvoApiResponse<KinvoPortfolioProduct[]>>(key);
		}

		// Similar ao https://k2c-api.kinvo.com.br/v2/consolidation/portfolios/1240278/assets mas este não traz equity e mais
		return this.http.get<KinvoApiResponse<KinvoPortfolioProduct[]>>
			(`${this.urlBase}portfolio-command/portfolioProduct/GetByPortfolio/${id}`)
			.pipe(
				retry(3),
				tap(response => this.cacheResponse(key, response))
			);
	}

	public getProductStatementByProduct(id: number) {

		const key = `getProductStatementByProduct-${id}`;

		if (this.cacheService.get(key)) {
			return this.cacheService.getObservable<KinvoApiResponse<KinvoPortfolioProductStatement[]>>(key);
		}

		// Similar ao https://k2c-api.kinvo.com.br/V2/consolidation/assets/44755657/statement mas este outro não traz iof e ir
		return this.http.get<KinvoApiResponse<KinvoPortfolioProductStatement[]>>
			(`${this.urlBase}portfolio-query/Statement/getProductStatement/${id}`)
			.pipe(
				retry(3),
				tap(response => this.cacheResponse(key, response))
			);
	}

	public getConsolidatedPortfolioAssets(id: number) {

		const key = `getConsolidationPortfolioAssets-${id}`;

		if (this.cacheService.get(key)) {
			return this.cacheService.getObservable<KinvoApiResponse<KinvoConsolidationPortfolioAsset[]>>(key);
		}

		return this.http.get<KinvoApiResponse<KinvoConsolidationPortfolioAsset[]>>
			(`${this.urlBase}v2/consolidation/portfolios/${id}/assets`)
			.pipe(
				retry(3),
				tap(response => this.cacheResponse(key, response))
			);
	}

	public getFundsDailyEquityByPortfolio(id: number) {

		const key = `getAssetClassFundDailyEquityByPortfolio-${id}`;

		if (this.cacheService.get(key)) {
			return this.cacheService.getObservable<KinvoApiResponse<KinvoFundDailyEquity[]>>(key);
		}

		return this.http.get<KinvoApiResponse<KinvoFundDailyEquity[]>>
			(`${this.urlBase}portfolio-query/AssetClassFundConsolidation/GetDailyEquityByPortfolio/${id}`)
			.pipe(
				retry(3),
				tap(response => this.cacheResponse(key, response))
			);
	}

	public getFundsSnapshotByPortfolio(id: number) {

		const key = `getFundsSnapshotByPortfolio-${id}`;

		if (this.cacheService.get(key)) {
			return this.cacheService.getObservable<KinvoApiResponse<KinvoFundSnapshot[]>>(key);
		}

		return this.http.get<KinvoApiResponse<KinvoFundSnapshot[]>>
			(`${this.urlBase}portfolio-query/AssetClassFundConsolidation/GetSnapshotByProduct/${id}`)
			.pipe(
				retry(3),
				tap(response => this.cacheResponse(key, response))
			);
	}
}
