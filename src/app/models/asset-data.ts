export interface AssetData {
	productId: number;
	productName: string;
	portfolioProductId: number;
	productTypeId: number;
	productTypeName: string;
	financialInstitutionId: number;
	financialInstitutionName: string;
	strategyOfDiversificationId: number;
	strategyOfDiversificationDescription: string;
	valueApplied: number;
	equity: number;
	profitability: number;
	portfolioPercentage: number;

	productStatements: StatementData[];
	dailyEquity: EquityData[];
	monthlyCapitalGain: CapitalGainData[];
}

export interface StatementData {
	id: number;
	description: string;
	movementType: number;
	date: Date;
	equity: number;
	amount: number;
	value: number;
	incomeTax: number;
	iof: number;
	cost: number;
}

export interface EquityData {
	referenceDate: Date;
	correctedQuota: number;
	value: number;
	movementTypeId: number;
}

export interface CapitalGainData {
	referenceDate: Date;
	valueApplied: number;
	initialEquity: number;
	applications: number;
	redemptions: number;
	returns: number;
	proceeds: number;
	capitalGain: number;
	finalEquity: number;

	net: number; // parece ser movimentação no mês

	incomeTax: number;
	iof: number;
	cost: number;
	charges: number;
}
