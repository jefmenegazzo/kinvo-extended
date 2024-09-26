export interface KinvoPortfolioProfitability {
    dailyProfitabilityToChart: ChartData;
    monthlyProfitabilityToChart: ChartData;
    annualProfitabilityToChart: ChartData;
    realRateOfReturn: RealRateOfReturn;
    summaryByDateRange: SummaryByDateRange;
}

export interface SeriesData {
    name: string;
    data: number[];
    visible?: boolean;
}

export interface ChartData {
    categories: string[] | number[];
    series: SeriesData[];
}

export interface RealRateOfReturn {
    portfolioRateOfReturn: number;
    realRateOfReturn: number;
    rateOverCDI: number;
}

export interface Profitability {
    portfolioProfitability: number;
    firstSerieProfitability: number;
    secondSerieProfitability: number;
    thirdSerieProfitability: number;
    fourthSerieProfitability: number;
    fifthSerieProfitability: number;
}

export interface SummaryByDateRange {
    lastDay: Profitability;
    inTheMonth: Profitability;
    inTheYear: Profitability;
    in12Months: Profitability;
    in24Months: Profitability;
    in36Months: Profitability;
    fromBegin: Profitability;
}
