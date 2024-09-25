import { Routes } from "@angular/router";

export const routes: Routes = [
	{
		path: "",
		redirectTo: "rentabilidade",
		pathMatch: "full",
	},
	{
		path: "ativos",
		loadChildren: () => import("./components/ativos/ativos.routes").then((m) => m.remoteRoutes),
	},
	{
		path: "distribuicao",
		loadChildren: () => import("./components/distribuicao/distribuicao.routes").then((m) => m.remoteRoutes),
	},
	{
		path: "lista-fundos-investimento",
		loadChildren: () => import("./components/lista-fundos-investimento/lista-fundos-investimento.routes").then((m) => m.remoteRoutes),
	},
	{
		path: "login",
		loadChildren: () => import("./components/login/login.routes").then((m) => m.remoteRoutes),
	},
	{
		path: "rentabilidade",
		loadChildren: () => import("./components/rentabilidade/rentabilidade.routes").then((m) => m.remoteRoutes),
	},
];
