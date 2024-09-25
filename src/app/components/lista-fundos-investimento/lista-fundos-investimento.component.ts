import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
	selector: "app-lista-fundos-investimento",
	standalone: true,
	imports: [CommonModule],
	templateUrl: "./lista-fundos-investimento.component.html",
	styleUrl: "./lista-fundos-investimento.component.scss",
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaFundosInvestimentoComponent {}
