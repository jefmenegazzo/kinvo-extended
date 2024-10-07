import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { MessageService } from "primeng/api";
import { Observable } from "rxjs/internal/Observable";
import { throwError } from "rxjs/internal/observable/throwError";
import { catchError } from "rxjs/internal/operators/catchError";
import { CacheService, KINVO_KEYS } from "../services/cache.service";

export function requestInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {

	const messageService = inject(MessageService);
	const cacheService = inject(CacheService);

	if (cacheService.get(KINVO_KEYS.TOKEN)) { // req.url.startsWith("kinvo") &&

		req = req.clone({
			setHeaders: {
				"authorization": `Bearer ${cacheService.get<string>(KINVO_KEYS.TOKEN)}`,
			},
		});
	}

	return next(req).pipe(
		catchError((httpError: HttpErrorResponse) => {
			messageService.add({ severity: "error", summary: "Erro", detail: httpError?.error?.error?.message || httpError.message });
			return throwError(() => httpError);
		})
	);
}
