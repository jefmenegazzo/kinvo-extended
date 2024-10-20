import { AssetData } from "./asset-data";

export interface GeneralFilterData {
	label: string;
	id: number;
	field: keyof AssetData; // "strategyOfDiversificationId" | "productTypeId" | "financialInstitutionId" | "productId"
}
