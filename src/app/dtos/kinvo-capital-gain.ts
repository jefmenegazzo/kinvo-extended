export interface KinvoCapitalGain {
    bigNumbers: BigNumbers;
    capitalGainByProductInTheMonth: CapitalGainByProduct[];
}

export interface BigNumbers {
    previousEquity: number;
    applications: number;
    redemptions: number;
    capitalGain: number;
    percentageResult: number;
}

export interface CapitalGainByProduct {
    portfolioProductId: number;
    monthlyReferenceDate: string;
    initialEquity: number;
    finalEquity: number;
    valueApplied: number;
    net: number;
    applications: number;
    redemptions: number;
    returns: number;
    proceeds: number;
    capitalGain: number;
    checkingAccount: number;
    productTypeId: number;
    productName: string;
    initialDate: string;
    amortization: number;
}
