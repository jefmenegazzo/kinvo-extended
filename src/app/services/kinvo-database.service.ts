import { Injectable } from "@angular/core";
import { of } from "rxjs/internal/observable/of";
import { catchError } from "rxjs/internal/operators/catchError";
import { expand } from "rxjs/internal/operators/expand";
import { last } from "rxjs/internal/operators/last";
import { map } from "rxjs/internal/operators/map";
import { switchMap } from "rxjs/internal/operators/switchMap";
import { takeWhile } from "rxjs/internal/operators/takeWhile";
import { KinvoServiceApi } from "./kinvo.service.api";

@Injectable({
	providedIn: "root"
})
export class KinvoDatabaseService {

	constructor(
		private readonly kinvoServiceApi: KinvoServiceApi
	) { }

	consolidatePortfolio(id: number) {
		return this.kinvoServiceApi.generateNewToken()
			.pipe(
				switchMap(() =>
					this.kinvoServiceApi.consolidatePortfolio(id)
						.pipe(
							switchMap(response =>
								response.data.consolidationRoute !== "QUEUED"
									? of(true)
									: this.kinvoServiceApi.isPortfolioConsolidationInProgress(id).pipe(
										expand(() => this.kinvoServiceApi.isPortfolioConsolidationInProgress(id)),
										map(response => !response.data.inProgress),
										takeWhile((finished, index) => finished === false && index < 5),
										last(undefined, true),
										catchError(() => of(false))
									)
							)
						)
				)
			);
	}

	loadPortfolioData() {

	}
}
