import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from 'primeng/password';
import { finalize } from "rxjs/internal/operators/finalize";
import { KinvoApiResponse } from "../../dtos/kinvo-api-response";
import { KinvoLogin } from "../../dtos/kinvo-login";
import { KinvoServiceApi } from "../../services/kinvo.service.api";

@Component({
	selector: "app-login",
	standalone: true,
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		ButtonModule,
		InputTextModule,
		PasswordModule,
		RouterModule
	],
	templateUrl: "./login.component.html",
	styleUrl: "./login.component.scss",
	// changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {

	loginForm!: FormGroup;
	loading = false;

	constructor(
		private fb: FormBuilder,
		private router: Router,
		private kinvoServiceApi: KinvoServiceApi
	) { }

	ngOnInit(): void {

		this.loginForm = this.fb.group({
			user: ["", Validators.required], // , Validators.email
			password: ["", Validators.required]
		});
	}

	onSubmit() {

		this.loginForm.markAllAsTouched();
		this.loginForm.markAsDirty();

		for (const control of Object.values(this.loginForm.controls)) {
			control.markAsDirty();
		}

		if (this.loginForm.valid) {

			this.loginForm.disable();
			this.loading = true;

			this.kinvoServiceApi.login(
				this.loginForm.value.user,
				this.loginForm.value.password
			).pipe(
				finalize(() => {
					this.loginForm.enable();
					this.loading = false;
				})
			).subscribe({
				next: (result: KinvoApiResponse<KinvoLogin>) => {

					if (result && result.success) {
						this.router.navigate(["/rentabilidade"]);
					}
				}
			});
		}
	}
}
