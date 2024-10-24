import { CommonModule } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { SkeletonModule } from "primeng/skeleton";

@Component({
	selector: "app-chart-skeleton",
	standalone: true,
	imports: [
		CommonModule,
		SkeletonModule
	],
	templateUrl: "./chart-skeleton.component.html",
	styleUrl: "./chart-skeleton.component.scss",
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartSkeletonComponent { }
