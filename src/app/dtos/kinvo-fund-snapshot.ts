export interface Fund {
	portfolioProductId: number;
	name: string;
	portfolioPercentage: number;
	sector: string;
}

export interface Position {
	equity: number;
	valueApplied: number;
}

export interface Profitability {
	inTheMonth: number;
	inTheYear: number;
	in12Months: number;
	in24Months: number;
	fromBeginning: number;
}

export interface Indexes {
	indexerValue: number;
	indexerLabel: string;
	percentageOverIndexer: number;
}

export interface KinvoFundSnapshot {
	fund: Fund;
	position: Position;
	profitability: Profitability;
	indexes: Indexes;
	hasBalance: number;
	productHasQuotation: number;
	// eslint-disable-next-line @typescript-eslint/naming-convention
	ProductHasNotPricePublished: boolean;
}
