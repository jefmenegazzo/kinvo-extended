import { HttpEvent, HttpHandlerFn, HttpRequest } from "@angular/common/http";
import { Observable } from "rxjs/internal/Observable";

export function requestInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {

	console.log("AQUI")

	req = req.clone({
		setHeaders: {
			"Access-Control-Allow-Origin": "*",
			"Content-Type": "application/json",
			"Access-Control-Allow-Methods": "GET, POST, PUT, DELETE",
			"Access-Control-Allow-Headers": "Content-Type, Authorization",
			"Access-Control-Allow-Credentials": "true"
		},
	});

	return next(req);
}
