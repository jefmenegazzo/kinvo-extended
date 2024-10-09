import { provideHttpClient, withFetch, withInterceptors } from "@angular/common/http";
import { ApplicationConfig, isDevMode, provideZoneChangeDetection } from "@angular/core";
import { initializeApp, provideFirebaseApp } from "@angular/fire/app";
import { getFirestore, provideFirestore } from "@angular/fire/firestore";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { provideRouter } from "@angular/router";
import { provideServiceWorker } from "@angular/service-worker";
import "chartjs-adapter-date-fns";
import "chartjs-plugin-datalabels";
import { ptBR } from "date-fns/locale/pt-BR";
import { setDefaultOptions } from "date-fns/setDefaultOptions";
import { MessageService } from "primeng/api";
import { routes } from "./app.routes";
import { requestInterceptor } from "./interceptors/request.interceptor";
import { CacheService } from "./services/cache.service";
setDefaultOptions({ locale: ptBR });

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
		CacheService,
		provideFirebaseApp(
			() => initializeApp({
				"projectId": "kinvo-extended",
				"appId": "1:999821913952:web:8ef266efd507e23d5a7805",
				"storageBucket": "kinvo-extended.appspot.com",
				"apiKey": "AIzaSyCPd1NIUEPBHO0Mj5AKMN8if9-SXo_WlL0",
				"authDomain": "kinvo-extended.firebaseapp.com",
				"messagingSenderId": "999821913952",
				"measurementId": "G-524BFJVPC8"
			})
		),
		provideFirestore(() => getFirestore())
	]
};
