import type { Route } from "@angular/router";
import { ListaFundosInvestimentoComponent } from "./lista-fundos-investimento.component";

export const remoteRoutes: Route[] = [
	{
		path: "",
		component: ListaFundosInvestimentoComponent,
	},
];
