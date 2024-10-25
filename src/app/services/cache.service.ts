/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable, isDevMode } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";

export const KINVO_KEYS = {
	TOKEN: "kinvoToken",
	REFRESH_TOKEN: "kinvoRenewToken",
	USER: "kinvoUser",
	PASSWORD: "kinvoPassword"
};

export interface CacheChangeEvent<T = unknown> {
	key: string;
	value: T;
}

// TODO adicionar tempo de vida para os dados em cache
@Injectable({
	providedIn: "root",
})
export class CacheService {

	private cache = new Map<string, unknown>();

	public cache$ = new BehaviorSubject<CacheChangeEvent>({ key: "", value: null });

	public set<T = unknown>(key: string, data: T, override: boolean = true): void {

		if (!this.isEnabled(key)) {
			return;
		}

		if (this.cache.has(key) && !override) {
			throw new Error(`Data already exists for key '${key}'. Use a different key, delete the existing one first or mark override to true.`);
		}

		this.cache.set(key, data);
		this.notifyChange(key, data);
	}

	public get<T = unknown>(key: string): T {

		if (!this.isEnabled(key)) {
			return null as T;
		}

		return this.cache.get(key) as T;
	}

	public getObservable<T = unknown>(key: string): Observable<T> {
		return of(this.get<T>(key));
	}

	public has(key: string): boolean {
		return this.cache.has(key);
	}

	public clear(key: string): void {
		this.cache.delete(key);
		this.notifyChange(key, null);
	}

	public clearAll(): void {

		Array.from(this.cache.keys()).forEach((key) => {
			this.clear(key);
		});
	}

	private notifyChange<T = unknown>(key: string, value: T): void {
		this.cache$.next({ key: key, value: value });
	}

	private isEnabled(key: string) {
		return true; // isDevMode() || Object.values(KINVO_KEYS).includes(key);
	}
}
