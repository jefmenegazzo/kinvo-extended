import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { RouterModule, RouterOutlet } from "@angular/router";
import { MenuItem } from "primeng/api";
import { TabMenuModule } from "primeng/tabmenu";
import { ToastModule } from "primeng/toast";
import { KinvoServiceApi } from "./services/kinvo.service.api";

@Component({
	selector: "app-root",
	standalone: true,
	imports: [
		CommonModule,
		RouterModule,
		RouterOutlet,
		TabMenuModule,
		ToastModule
	],
	providers: [KinvoServiceApi],
	templateUrl: "./app.component.html",
	styleUrl: "./app.component.scss",
})
export class AppComponent implements OnInit {

	items: MenuItem[] | undefined;

	ngOnInit() {
		this.items = [
			{
				label: "Rentabilidade",
				icon: "finance",
				routerLink: "/rentabilidade",
			},
			{
				label: "Distribuição",
				icon: "donut_large",
				routerLink: "/distribuicao",
			},
			{
				label: "Ativos",
				icon: "account_balance",
				routerLink: "/ativos",
			},
			{
				label: "Lista de Fundos Investimento",
				icon: "list_alt",
				routerLink: "/lista-fundos-investimento",
			},
		];
	}
}
