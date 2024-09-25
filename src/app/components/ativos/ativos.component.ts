import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
	selector: "app-ativos",
	standalone: true,
	imports: [CommonModule],
	templateUrl: "./ativos.component.html",
	styleUrl: "./ativos.component.scss",
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AtivosComponent {}
