import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable()
export class KinvoServiceApi {

	url_base = "kinvo/"

	constructor(private http: HttpClient) { }

	public login(user: string, password: string) {

		const json_data = {
			'email': user,
			'password': password
		}

		return this.http.post(`${this.url_base}v4/auth/login`, json_data); // 'v3/auth/login'
	}
}
