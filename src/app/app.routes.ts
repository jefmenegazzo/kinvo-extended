import { Routes } from "@angular/router";
import { loginGuard } from "./guards/login.guard";

export const routes: Routes = [
	{
		path: "",
		redirectTo: "login",
		pathMatch: "full",
	},
	{
		path: "login",
		loadChildren: () => import("./components/login/login.routes").then((m) => m.remoteRoutes),
	},
	{
		path: "ativos",
		loadChildren: () => import("./components/ativos/ativos.routes").then((m) => m.remoteRoutes),
		canActivate: [loginGuard],
	},
	{
		path: "distribuicao",
		loadChildren: () => import("./components/distribuicao/distribuicao.routes").then((m) => m.remoteRoutes),
		canActivate: [loginGuard],
	},
	{
		path: "lista-fundos-investimento",
		loadChildren: () => import("./components/lista-fundos-investimento/lista-fundos-investimento.routes").then((m) => m.remoteRoutes),
		canActivate: [loginGuard],
	},
	{
		path: "rentabilidade",
		loadChildren: () => import("./components/rentabilidade/rentabilidade.routes").then((m) => m.remoteRoutes),
		canActivate: [loginGuard],
	},
];
