export interface KinvoConsolidationPortfolioAsset {
	portfolioProductId: number;
	productId: number;
	productName: string;
	productTypeId: number;
	financialInstitutionId: number;
	financialInstitutionName: string;
	issuerId: number | null;
	issuerName: string | null;
	firstApplicationDate: string;
	lastUpdate: string;
	valueApplied: number;
	equity: number;
	profitability: number;
	portfolioPercentage: number;
	hasBalance: boolean;
	hasMovementsWaitingForQuota: boolean;
	productHasQuotation: boolean;
	productHasNotPricePublished: boolean;
	productHasPublishedPrice: boolean;
	productHasBeenImported: boolean;
	partnerId: number | null;
	partnerUserId: number | null;
	partnerUserAlias: string | null;
	productCanBeEdited: boolean;
	userCanUpdateMovements: boolean;
	strategyOfDiversificationId: number;
	strategyOfDiversificationDescription: string;
	portfolioCurrencySymbol: string;
	productCurrencySymbol: string;
	productCountryCode: string;
	tagDescription: string | null;
	tagId: number | null;
	updatedAt: string;
	partner: boolean;
	canBeEdited: boolean;
	countryCode: string;
	currencySymbol: string;
	hasBeenImported: boolean;
	hasNotPricePublished: boolean;
	hasPublishedPrice: boolean;
	hasQuotation: boolean;
	id: number;
	type: number;
	name: string;
	portfolio: Portfolio;
	financialInstitution: FinancialInstitution;
	diversificationStrategy: DiversificationStrategy;
	permissions: Permissions;
}

export interface Portfolio {
	currencySymbol: string;
}

export interface FinancialInstitution {
	id: number;
	name: string;
}

export interface DiversificationStrategy {
	id: number;
	description: string;
}

export interface Permissions {
	canBeEdited: boolean;
	canUpdateMovements: boolean;
}
