import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router, RouterModule, RouterOutlet } from "@angular/router";
import { MenuItem } from "primeng/api";
import { MenubarModule } from "primeng/menubar";
import { ToastModule } from "primeng/toast";
// import { delay } from "rxjs/internal/operators/delay";
import { Subscription } from "rxjs/internal/Subscription";
import { CacheService, KINVO_KEYS } from "./services/cache.service";
import { SessionService } from "./services/session.service";

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
	templateUrl: "./app.component.html",
	styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit, OnDestroy {

	items: MenuItem[] | undefined;
	hasLogin: boolean = false;
	subscriptions: Subscription[] = [];

	constructor(
		private cacheService: CacheService,
		private sessionService: SessionService,
		private router: Router,
	) {

		const subscription = this.cacheService.cache$
			// .pipe(
			// 	delay(1000)
			// )
			.subscribe((event) => {

				if (event?.key === KINVO_KEYS.TOKEN) {
					this.hasLogin = !!event.value;
				}
			});

		this.subscriptions.push(subscription);
	}

	ngOnInit() {
		this.items = [
			{
				label: "Dashboard",
				icon: "track_changes",
				routerLink: "/dashboard",
				routerLinkActiveOptions: { exact: true }
			},
			{
				label: "Análises",
				icon: "finance",
				routerLink: "/analises",
				routerLinkActiveOptions: { exact: true }
			},
			{
				label: "Ativos",
				icon: "account_balance_wallet",
				routerLink: "/ativos",
				routerLinkActiveOptions: { exact: true }
			},
			{
				label: "Extrato",
				icon: "receipt",
				routerLink: "/extrato",
				routerLinkActiveOptions: { exact: true }
			},
			{
				label: "Sincronização",
				icon: "sync",
				routerLink: "/sincronizacao",
				routerLinkActiveOptions: { exact: true }
			}
		];
	}

	ngOnDestroy() {
		this.subscriptions.forEach((subscription) => subscription.unsubscribe);
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async logout(event: MouseEvent | KeyboardEvent) {
		await this.sessionService.clearEncryptedDataFromStorage();
		this.cacheService.clearAll();
		await this.router.navigate(["login"]);
	}
}
