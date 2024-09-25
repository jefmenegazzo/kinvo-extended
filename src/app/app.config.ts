import { provideHttpClient, withFetch, withInterceptors } from "@angular/common/http";
import { ApplicationConfig, isDevMode, provideZoneChangeDetection } from "@angular/core";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { provideRouter } from "@angular/router";
import { provideServiceWorker } from "@angular/service-worker";
import { MessageService } from "primeng/api";
import { routes } from "./app.routes";
import { requestInterceptor } from "./interceptors/request.interceptor";

export const appConfig: ApplicationConfig = {
	providers: [
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideRouter(routes),
		provideHttpClient(withFetch(), withInterceptors([requestInterceptor])),
		provideAnimationsAsync(),
		provideServiceWorker("ngsw-worker.js", {
			enabled: !isDevMode(),
			registrationStrategy: "registerWhenStable:30000",
		}),
		MessageService,
	],
};
