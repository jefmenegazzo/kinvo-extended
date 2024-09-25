import type { Route } from "@angular/router";
import { LoginComponent } from "./login.component";

export const remoteRoutes: Route[] = [
	{
		path: "",
		component: LoginComponent,
	},
];
