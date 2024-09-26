import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { tap } from "rxjs/internal/operators/tap";
import { KinvoApiResponse } from "../dtos/kinvo-api-response";
import { KinvoCapitalGain } from "../dtos/kinvo-capital-gain";
import { KinvoLogin } from "../dtos/kinvo-login";
import { KinvoPortfolio } from "../dtos/kinvo-portfolio";
import { KinvoPortfolioProfitability } from "../dtos/kinvo-portfolio-profitability";
import { environment } from "../environments/environment";
import { CacheService } from "./cache.service";

@Injectable()
export class KinvoServiceApi {

	url_base = "kinvo/";

	constructor(
		private http: HttpClient,
		private cacheService: CacheService,
	) { }

	private saveLogin(user: string, password: string, token: string) {
		environment.kinvo_user = user;
		environment.kinvo_password = password;
		environment.kinvo_token = token;
		// localStorage.setItem("kinvo_user", user);
		// localStorage.setItem("kinvo_password", password);
	}

	private saveLogout() {
		environment.kinvo_user = "";
		environment.kinvo_password = "";
		environment.kinvo_token = "";
		// localStorage.removeItem("kinvo_user");
		// localStorage.removeItem("kinvo_password");
	}

	public loadLogin() {
		// environment.kinvo_user = localStorage.getItem("kinvo_user")!;
		// environment.kinvo_password = localStorage.getItem("kinvo_password")!;
	}

	public logout() {
		this.saveLogout();
	}

	public login(user: string, password: string) {

		const json_data = {
			email: user,
			password: password,
		};

		return this.http.post<KinvoApiResponse<KinvoLogin>>
			(`${this.url_base}v4/auth/login`, json_data) // 'v3/auth/login'
			.pipe(
				tap(response => {
					if (response.success) {
						this.saveLogin(user, password, response.data.accessToken);
					}
				})
			);
	}

	public getPortfolios() {

		const key = "getPortfolios";

		if (this.cacheService.get(key)) {
			return this.cacheService.getObservable<KinvoApiResponse<KinvoPortfolio[]>>(key);
		}

		return this.http.get<KinvoApiResponse<KinvoPortfolio[]>>
			(`${this.url_base}portfolio-command/portfolio/getPortfolios`)
			.pipe(
				tap(response => {
					this.cacheService.set(key, response);
				})
			);
	}

	public getPeriodicPortfolioProfitability(id: number, period: number = 1) {

		const key = `getPeriodicPortfolioProfitability-${id}-${period}`;

		if (this.cacheService.get(key)) {
			return this.cacheService.getObservable<KinvoApiResponse<KinvoPortfolioProfitability>>(key);
		}

		return this.http.get<KinvoApiResponse<KinvoPortfolioProfitability>>
			(`${this.url_base}portfolio-query/PortfolioAnalysis/GetPeriodicPortfolioProfitability/${id}/${period}`)
			.pipe(
				tap(response => {
					this.cacheService.set(key, response);
				})
			);
	}

	public getCapitalGainByPortfolio(id: number) {

		const key = `getCapitalGainByPortfolio-${id}`;

		if (this.cacheService.get(key)) {
			return this.cacheService.getObservable<KinvoApiResponse<KinvoCapitalGain>>(key);
		}

		return this.http.get<KinvoApiResponse<KinvoCapitalGain>>
			(`${this.url_base}capital-gain/by-portfolio/${id}`)
			.pipe(
				tap(response => {
					this.cacheService.set(key, response);
				})
			);
	}
}
