import type { Route } from "@angular/router";
import { DashboardComponent } from "./dashboard.component";

export const remoteRoutes: Route[] = [
	{
		path: "",
		component: DashboardComponent,
	},
];
