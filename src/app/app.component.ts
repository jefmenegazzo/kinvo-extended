import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { RouterModule, RouterOutlet } from "@angular/router";
import { MenuItem } from "primeng/api";
import { MenubarModule } from 'primeng/menubar';
import { ToastModule } from "primeng/toast";
import { Subscription } from "rxjs/internal/Subscription";
import { CacheService, KINVO_KEYS } from "./services/cache.service";
import { KinvoServiceApi } from "./services/kinvo.service.api";

@Component({
	selector: "app-root",
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		RouterOutlet,
		ToastModule,
		MenubarModule
	],
	providers: [
		KinvoServiceApi
	],
	templateUrl: "./app.component.html",
	styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit, OnDestroy {

	items: MenuItem[] | undefined;
	hasLogin: boolean = false;
	subscriptions: Subscription[] = [];

	constructor(
		private cacheService: CacheService
	) {

		const subscription = this.cacheService.cache$.subscribe((event) => {

			if (event?.key === KINVO_KEYS.TOKEN) {
				this.hasLogin = !!event.value;
			}
		});

		this.subscriptions.push(subscription);
	}

	ngOnInit() {
		this.items = [
			{
				label: "Rentabilidade",
				icon: "finance",
				routerLink: "/rentabilidade",
				routerLinkActiveOptions: { exact: true }
			},
			{
				label: "Distribuição",
				icon: "donut_large",
				routerLink: "/distribuicao",
				routerLinkActiveOptions: { exact: true }
			},
			{
				label: "Ativos",
				icon: "account_balance",
				routerLink: "/ativos",
				routerLinkActiveOptions: { exact: true }
			},
			{
				label: "Lista de Fundos Investimento",
				icon: "list_alt",
				routerLink: "/lista-fundos-investimento",
				routerLinkActiveOptions: { exact: true }
			},
		];
	}

	ngOnDestroy() {
		this.subscriptions.forEach((subscription) => subscription.unsubscribe);
	}
}
