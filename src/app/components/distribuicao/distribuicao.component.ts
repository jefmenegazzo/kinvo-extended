import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
	selector: "app-distribuicao",
	standalone: true,
	imports: [CommonModule],
	templateUrl: "./distribuicao.component.html",
	styleUrl: "./distribuicao.component.scss",
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DistribuicaoComponent {}
