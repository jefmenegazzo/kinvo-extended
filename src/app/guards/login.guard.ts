import { inject } from "@angular/core";
import { Router, type ActivatedRouteSnapshot, type CanActivateFn, type RouterStateSnapshot } from "@angular/router";
import { CacheService, KINVO_KEYS } from "../services/cache.service";

export const loginGuard: CanActivateFn = async (
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	next: ActivatedRouteSnapshot,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	state: RouterStateSnapshot,
) => {

	const router = inject(Router);
	const cacheService = inject(CacheService);

	if (cacheService.get(KINVO_KEYS.TOKEN)) {
		return true;

	} else {
		await router.navigate(["/login"]);
		return false;
	}
};
