import { KinvoApiResponse } from "./kinvo-api-response";
import { KinvoPortfolioProductStatement } from "./kinvo-portfolio-product-statement";

export interface KinvoPortfolioProduct {
    financialInstitutionId: number;
    financialInstitutionName: string;
    portfolioProductId: number;
    productName: string;
    productHeritance: number;
    hasBalance: boolean;
    productCountryCode: string;
    productCurrencySymbol: string;
    partnerId: number | null;
    partnerUserId: number | null;
    productCanBeEdited: boolean;
    userCanCreateMovements: boolean;
    userCanCreateEvents: boolean;
    partnerUserAlias: string;
    isPositionProduct: boolean;

	statements: KinvoApiResponse<KinvoPortfolioProductStatement[]>;
}
