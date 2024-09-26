import { CapitalGainByProduct } from "../dtos/kinvo-capital-gain";

export interface CapitalGainByProductTableItem extends Pick<CapitalGainByProduct,
	// "monthlyReferenceDate" |
	"initialEquity" |
	"finalEquity" |
	"valueApplied" |
	"net" |
	"applications" |
	"redemptions" |
	"returns" |
	"proceeds" |
	"capitalGain" |
	"checkingAccount" |
	"amortization"
> {
	monthlyReferenceDate: Date;
}
