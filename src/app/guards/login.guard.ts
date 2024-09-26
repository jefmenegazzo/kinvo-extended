import { inject } from "@angular/core";
import { Router, type ActivatedRouteSnapshot, type CanActivateFn, type RouterStateSnapshot } from "@angular/router";
import { environment } from "../environments/environment";

export const loginGuard: CanActivateFn = async (
	next: ActivatedRouteSnapshot,
	state: RouterStateSnapshot,
) => {

	const router = inject(Router);

	if (environment.kinvo_token) {
		return true;

	} else {
		await router.navigate(["/login"]);
		return false;
	}
};
