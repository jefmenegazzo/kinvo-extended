export interface AggregatedProfitabilityByDate {
	referenceDate: Date;
	carteira: number;
	cdi: number;
	ibov: number;
	inflacao: number;
	poupanca: number
}

export interface ProfitabilityData {
	daily: AggregatedProfitabilityByDate[];
	monthly: AggregatedProfitabilityByDate[];
	yearly: AggregatedProfitabilityByDate[];
}
