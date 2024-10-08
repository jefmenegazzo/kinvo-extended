import { HttpClient } from "@angular/common/http";
import { Injectable, isDevMode } from "@angular/core";
import { tap } from "rxjs/internal/operators/tap";
import { KinvoApiResponse } from "../dtos/kinvo-api-response";
import { KinvoCapitalGain } from "../dtos/kinvo-capital-gain";
import { KinvoLogin } from "../dtos/kinvo-login";
import { KinvoPortfolio } from "../dtos/kinvo-portfolio";
import { KinvoPortfolioGoalStatus } from "../dtos/kinvo-portfolio-goal-status";
import { KinvoPortfolioProduct } from "../dtos/kinvo-portfolio-product";
import { KinvoPortfolioProductStatement } from "../dtos/kinvo-portfolio-product-statement";
import { KinvoPortfolioProfitability } from "../dtos/kinvo-portfolio-profitability";
import { CacheService } from "./cache.service";

@Injectable({
	providedIn: "root",
})
export class KinvoServiceApi {

	urlBase = isDevMode()
		? "kinvo/"
		: "https://kinvo-extended-proxy.jef-menegazzo.workers.dev/";

	constructor(
		private http: HttpClient,
		private cacheService: CacheService,
	) { }

	public login(user: string, password: string) {

		const jsonData = {
			email: user,
			password: password,
		};

		return this.http.post<KinvoApiResponse<KinvoLogin>>
			(`${this.urlBase}v4/auth/login`, jsonData); // 'v3/auth/login'
	}

	public refreshToken(refreshToken: string) {

		const jsonData = {
			refreshToken: refreshToken
		};

		return this.http.post<KinvoApiResponse<KinvoLogin>>
			(`${this.urlBase}auth/sessions/refresh-token`, jsonData);
	}

	public getPortfolios() {

		const key = "getPortfolios";

		if (this.cacheService.get(key)) {
			return this.cacheService.getObservable<KinvoApiResponse<KinvoPortfolio[]>>(key);
		}

		return this.http.get<KinvoApiResponse<KinvoPortfolio[]>>
			(`${this.urlBase}portfolio-command/portfolio/getPortfolios`)
			.pipe(
				tap(response => {
					if (response.success) {
						this.cacheService.set(key, response);
					}
				})
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
				tap(response => {
					if (response.success) {
						this.cacheService.set(key, response);
					}
				})
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
				tap(response => {
					if (response.success) {
						this.cacheService.set(key, response);
					}
				})
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
				tap(response => {
					if (response.success) {
						this.cacheService.set(key, response);
					}
				})
			);
	}

	public getPortfolioProductByPortfolio(id: number) {

		const key = `getPortfolioProductByPortfolio-${id}`;

		if (this.cacheService.get(key)) {
			return this.cacheService.getObservable<KinvoApiResponse<KinvoPortfolioProduct[]>>(key);
		}

		return this.http.get<KinvoApiResponse<KinvoPortfolioProduct[]>>
			(`${this.urlBase}portfolio-command/portfolioProduct/GetByPortfolio/${id}`)
			.pipe(
				tap(response => {
					if (response.success) {
						this.cacheService.set(key, response);
					}
				})
			);
	}

	public getProductStatementByProduct(id: number) {

		const key = `getProductStatementByProduct-${id}`;

		if (this.cacheService.get(key)) {
			return this.cacheService.getObservable<KinvoApiResponse<KinvoPortfolioProductStatement[]>>(key);
		}

		return this.http.get<KinvoApiResponse<KinvoPortfolioProductStatement[]>>
			(`${this.urlBase}portfolio-query/Statement/getProductStatement/${id}`)
			.pipe(
				tap(response => {
					if (response.success) {
						this.cacheService.set(key, response);
					}
				})
			);
	}
}