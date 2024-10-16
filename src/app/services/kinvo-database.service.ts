/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from "@angular/core";
import { fromUnixTime, parseISO } from "date-fns";
import { forkJoin } from "rxjs/internal/observable/forkJoin";
import { of } from "rxjs/internal/observable/of";
import { catchError } from "rxjs/internal/operators/catchError";
import { expand } from "rxjs/internal/operators/expand";
import { last } from "rxjs/internal/operators/last";
import { map } from "rxjs/internal/operators/map";
import { switchMap } from "rxjs/internal/operators/switchMap";
import { takeWhile } from "rxjs/internal/operators/takeWhile";
import { tap } from "rxjs/internal/operators/tap";
import { KinvoApiResponse } from "../dtos/kinvo-api-response";
import { KinvoCapitalGain } from "../dtos/kinvo-capital-gain";
import { KinvoConsolidationPortfolioAsset } from "../dtos/kinvo-consolidation-portfolio-asset";
import { KinvoFundDailyEquity } from "../dtos/kinvo-fund-daily-equity";
import { KinvoFundSnapshot } from "../dtos/kinvo-fund-snapshot";
import { KinvoPortfolioProduct } from "../dtos/kinvo-portfolio-product";
import { KinvoPortfolioProfitability } from "../dtos/kinvo-portfolio-profitability";
import { AssetData } from "../models/asset-data";
import { PortfolioData } from "../models/portfolio-data";
import { CacheService } from "./cache.service";
import { KinvoServiceApi } from "./kinvo.service.api";

@Injectable({
	providedIn: "root"
})
export class KinvoDatabaseService {

	mapProductTypeIdToName: Record<number, string> = {
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

	mapStrategyOfDiversificationIdToDescription: Record<number, string> = {
		3: "Renda Fixa", // RENDA FIXA PÓS-FIXADA
		4: "Multimercado", // MULTIMERCADOS
		5: "Renda Variável" // RENDA VARIÁVEL
	};

	mapSectorToStrategyOfDiversificationId: Record<string, number> = {
		"Renda Fixa": 3,
		"Multimercado": 4,
		"Ações": 5
	};

	constructor(
		private readonly kinvoServiceApi: KinvoServiceApi,
		private readonly cacheService: CacheService
	) { }

	loadPortfolios() {
		const key = "KinvoDatabaseService.loadPortfolios";
		return this.cacheService.get(key)
			? this.cacheService.getObservable<PortfolioData[]>(key)
			: this.kinvoServiceApi.login()
				.pipe(
					switchMap(() =>
						this.kinvoServiceApi.getPortfolios()
							.pipe(
								map(response => response.data.map(portfolio => ({
									id: portfolio.id,
									title: portfolio.title,
									isPrincipal: portfolio.isPrincipal
								} as PortfolioData)))
							)
					),
					tap(result => this.cacheService.set(key, result))
				);
	}

	consolidatePortfolio(id: number) {
		return this.kinvoServiceApi.login()
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

	loadPortfolioData(id: number) {

		return this.consolidatePortfolio(id).pipe(
			switchMap(() =>
				forkJoin([
					this.kinvoServiceApi.getPortfolioProductByPortfolio(id),
					this.kinvoServiceApi.getConsolidatedPortfolioAssets(id),
					this.kinvoServiceApi.getFundsSnapshotByPortfolio(id),
					this.kinvoServiceApi.getFundsDailyEquityByPortfolio(id),
					this.kinvoServiceApi.getCapitalGainByPortfolio(id),
					this.kinvoServiceApi.getPeriodicPortfolioProfitability(id)
				])
			),
			switchMap(([products, consolidatedAssets, fundsSnapshot, fundsDailyEquity, capitalGain, profitability]) =>
				forkJoin(
					products.data?.map(product =>
						this.kinvoServiceApi.getProductStatementByProduct(product.portfolioProductId)
							.pipe(
								map(response => {
									product.statements = response;
									return product;
								})
							)
					)
				).pipe(
					map(() => {

						const successes = [
							products.success,
							consolidatedAssets.success,
							fundsSnapshot.success,
							fundsDailyEquity.success,
							capitalGain.success,
							profitability.success,
							...products.data.map(product => product.statements.success)
						];

						if (successes.some(success => !success)) {
							throw new Error("Não foram carregados todos os dados do portfolio");
						}

						return this.mergePortfolioData(products, consolidatedAssets, fundsSnapshot, fundsDailyEquity, capitalGain, profitability);
					})
				)
			)
		);
	}

	private mergePortfolioData(
		products: KinvoApiResponse<KinvoPortfolioProduct[]>,
		consolidatedAssets: KinvoApiResponse<KinvoConsolidationPortfolioAsset[]>,
		fundsSnapshot: KinvoApiResponse<KinvoFundSnapshot[]>,
		fundsDailyEquity: KinvoApiResponse<KinvoFundDailyEquity[]>,
		capitalGain: KinvoApiResponse<KinvoCapitalGain>,
		profitability: KinvoApiResponse<KinvoPortfolioProfitability>
	) {
		const assets: AssetData[] = [];

		for (const product of products.data) {

			const consolidatedAsset = consolidatedAssets.data.find(asset => asset.portfolioProductId === product.portfolioProductId)!;
			const fundSnapshot = fundsSnapshot.data.find(fund => fund.fund.portfolioProductId === product.portfolioProductId);

			const asset: AssetData = {
				productId: consolidatedAsset.productId,
				productName: consolidatedAsset.productName ?? product.productName,
				portfolioProductId: consolidatedAsset.portfolioProductId ?? product.portfolioProductId,
				productTypeId: consolidatedAsset.productTypeId,
				productTypeName: this.mapProductTypeIdToName[consolidatedAsset.productTypeId],
				financialInstitutionId: consolidatedAsset.financialInstitutionId ?? product.financialInstitutionId,
				financialInstitutionName: consolidatedAsset.financialInstitutionName ?? product.financialInstitutionName,
				strategyOfDiversificationId: consolidatedAsset.strategyOfDiversificationId,
				strategyOfDiversificationDescription: consolidatedAsset.strategyOfDiversificationDescription,
				valueApplied: consolidatedAsset.valueApplied ?? fundSnapshot?.position.equity,
				equity: consolidatedAsset.equity ?? fundSnapshot?.position.equity,
				profitability: consolidatedAsset.profitability ?? fundSnapshot?.profitability.fromBeginning,
				portfolioPercentage: consolidatedAsset.portfolioPercentage ?? fundSnapshot?.fund.portfolioPercentage,
				productStatements: product.statements.data.map(statement => ({
					id: statement.id,
					description: statement.description,
					movementType: statement.movementType,
					date: parseISO(statement.date),
					equity: statement.equity,
					amount: statement.amount,
					value: statement.value,
					incomeTax: statement.incomeTax || 0,
					iof: statement.iof || 0,
					cost: statement.cost || 0
				})),
				dailyEquity: fundsDailyEquity.data.filter(fund => fund.portfolioProductId === product.portfolioProductId).map(fund => ({
					referenceDate: fromUnixTime(fund.dailyReferenceDate),
					correctedQuota: fund.correctedQuota,
					value: fund.value,
					movementTypeId: fund.movementTypeId
				})),
				monthlyCapitalGain: capitalGain.data.capitalGainByProductInTheMonth.filter(capitalGain => capitalGain.portfolioProductId === product.portfolioProductId).map(capitalGain => ({
					referenceDate: parseISO(capitalGain.monthlyReferenceDate),
					valueApplied: capitalGain.valueApplied,
					initialEquity: capitalGain.initialEquity,
					applications: capitalGain.applications,
					redemptions: capitalGain.redemptions,
					returns: capitalGain.returns,
					proceeds: capitalGain.proceeds,
					capitalGain: capitalGain.capitalGain,
					finalEquity: capitalGain.finalEquity,
					net: capitalGain.net,
					incomeTax: 0,
					iof: 0,
					cost: 0,
					charges: 0
				}))
			};

			if (fundSnapshot) {
				asset.strategyOfDiversificationId = this.mapSectorToStrategyOfDiversificationId[fundSnapshot.fund.sector];
			}

			asset.strategyOfDiversificationDescription = this.mapStrategyOfDiversificationIdToDescription[asset.strategyOfDiversificationId];

			assets.push(asset);
		}

		console.log([products, consolidatedAssets, fundsDailyEquity, capitalGain, profitability]);
		return [assets];
	}
}
