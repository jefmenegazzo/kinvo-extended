import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { inject } from "@angular/core";
import { MessageService } from "primeng/api";
import { Observable } from "rxjs/internal/Observable";
import { throwError } from "rxjs/internal/observable/throwError";
import { catchError } from "rxjs/internal/operators/catchError";
import { environment } from "../environments/environment";

export function requestInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {

	if (req.url.startsWith("kinvo") && environment.kinvo_token) {

		req = req.clone({
			setHeaders: {
				"authorization": `Bearer ${environment.kinvo_token}`,
			},
		});
	}

	const messageService = inject(MessageService);

	return next(req).pipe(
		catchError((httpError: HttpErrorResponse) => {
			console.log(messageService);
			messageService.add({ severity: "error", summary: "Erro", detail: httpError?.error?.error?.message || httpError.message });
			return throwError(() => httpError);
		})
	);
}
