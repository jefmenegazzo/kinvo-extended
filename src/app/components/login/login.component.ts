import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterModule } from "@angular/router";
import { ButtonModule } from "primeng/button";
import { CheckboxModule } from "primeng/checkbox";
import { InputTextModule } from "primeng/inputtext";
import { PasswordModule } from "primeng/password";
import { finalize } from "rxjs/internal/operators/finalize";
import packageJson from "../../../../package.json";
import { KinvoApiResponse } from "../../dtos/kinvo-api-response";
import { KinvoLogin } from "../../dtos/kinvo-login";
import { StoragePayload } from "../../models/storage-payload";
import { FirebaseService } from "../../services/firebase.service";
import { KinvoServiceApi } from "../../services/kinvo.service.api";
import { SessionService } from "../../services/session.service";

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
		RouterModule,
		CheckboxModule
	],
	templateUrl: "./login.component.html",
	styleUrl: "./login.component.scss"
})
export class LoginComponent implements OnInit {

	loginForm!: FormGroup;
	loading = false;
	version = packageJson.version;

	constructor(
		private fb: FormBuilder,
		private router: Router,
		private kinvoServiceApi: KinvoServiceApi,
		private sessionService: SessionService,
		private firebaseService: FirebaseService,
	) { }

	ngOnInit(): void {

		this.loginForm = this.fb.group({
			user: ["", Validators.required], // , Validators.email
			password: ["", Validators.required],
			remember: [true]
		});

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		this.loadStorage().then(() => { }).catch((error) => { });
	}

	async loadStorage() {

		this.loading = true;

		const exists = await this.sessionService.isEncryptedDataInStorage();

		if (exists) {
			const key = await this.sessionService.loadCryptoKey();
			const data: StoragePayload = await this.sessionService.decryptDataFromStorage(key);
			this.loginForm.patchValue(data);
			this.onSubmit();
		}

		this.loading = false;
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
				this.loginForm.value.password,
				this.loginForm.value.remember
			).pipe(
				finalize(() => {
					this.loginForm.enable();
					this.loading = false;
				})
			).subscribe({
				next: async (result: KinvoApiResponse<KinvoLogin>) => {

					if (result && result.success) {
						this.loginForm.disable();
						await this.router.navigate(["analises"]);
						await this.firebaseService.incrementUserAccessCount(this.loginForm.value.user);
					}
				}
			});
		}
	}
}
