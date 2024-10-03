export interface CapitalGainByProductTableItem {
	monthlyReferenceDate: Date;
	valueApplied: number;
	initialEquity: number;
	applications: number;
	redemptions: number;
	movementations: number;
	returns: number;
	proceeds: number;
	capitalGain: number;
	finalEquity: number;
	incomeTax: number;
	iof: number;
	cost: number;
	charges: number;
	profitabilityCarteira: number;
	profitabilityCdi: number;
	profitabilityIbov: number;
	profitabilityInflacao: number;
	profitabilityPoupanca: number;
	profitabilityCarteiraPercentCdi?: number;
	profitabilityCarteiraPercentIbov?: number;
	profitabilityCarteiraPercentInflacao?: number;
	profitabilityCarteiraPercentPoupanca?: number;
}
