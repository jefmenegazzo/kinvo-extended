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
		path: "analises",
		loadChildren: () => import("./components/analises/analises.routes").then((m) => m.remoteRoutes),
		canActivate: [loginGuard],
	},
	{
		path: "ativos",
		loadChildren: () => import("./components/ativos/ativos.routes").then((m) => m.remoteRoutes),
		canActivate: [loginGuard],
	},
	{
		path: "extrato",
		loadChildren: () => import("./components/extrato/extrato.routes").then((m) => m.remoteRoutes),
		canActivate: [loginGuard],
	},
	{
		path: "sincronizacao",
		loadChildren: () => import("./components/sincronizacao/sincronizacao.routes").then((m) => m.remoteRoutes),
		canActivate: [loginGuard],
	},
	{
		path: "lista-fundos-investimento",
		loadChildren: () => import("./components/lista-fundos-investimento/lista-fundos-investimento.routes").then((m) => m.remoteRoutes),
		canActivate: [loginGuard],
	}
];
