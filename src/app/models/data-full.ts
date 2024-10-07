export interface DataFull {
	referenceDate: Date;
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

export type AggregationKeysFirstType = "initialEquity";

export type AggregationKeysLastType = "valueApplied" | "finalEquity";

export type AggregationKeysSumType = (
	"applications" |
	"redemptions" |
	"movementations" |
	"returns" |
	"proceeds" |
	"capitalGain" |
	"incomeTax" |
	"iof" |
	"cost" |
	"charges"
);

export type AggregationKeysJurosCompostosType = (
	"profitabilityCarteira" |
	"profitabilityCdi" |
	"profitabilityIbov" |
	"profitabilityInflacao" |
	"profitabilityPoupanca"
);

export type AggregationKeysPercentRelativeType = (
	"profitabilityCarteiraPercentCdi" |
	"profitabilityCarteiraPercentIbov" |
	"profitabilityCarteiraPercentInflacao" |
	"profitabilityCarteiraPercentPoupanca"
);

export const aggregationKeysFirst: AggregationKeysFirstType[] = ["initialEquity"];

export const aggregationKeysLast: AggregationKeysLastType[] = ["valueApplied", "finalEquity"];

export const aggregationKeysSum: AggregationKeysSumType[] = [
	"applications",
	"redemptions",
	"movementations",
	"returns",
	"proceeds",
	"capitalGain",
	"incomeTax",
	"iof",
	"cost",
	"charges"
];

export const aggregationKeysJurosCompostos: AggregationKeysJurosCompostosType[] = [
	"profitabilityCdi",
	"profitabilityIbov",
	"profitabilityInflacao",
	"profitabilityPoupanca",
	"profitabilityCarteira"
];

export const aggregationKeysPercentRelative: AggregationKeysPercentRelativeType[] = [
	"profitabilityCarteiraPercentCdi",
	"profitabilityCarteiraPercentIbov",
	"profitabilityCarteiraPercentInflacao",
	"profitabilityCarteiraPercentPoupanca"
];
