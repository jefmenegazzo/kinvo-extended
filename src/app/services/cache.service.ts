import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of } from "rxjs";

export interface CacheChangeEvent<T = any> {
	key: string;
	value: T;
}

@Injectable({
	providedIn: "root",
})
export class CacheService {

	private cache = new Map<string, any>();

	public cache$ = new BehaviorSubject<CacheChangeEvent | null>(null);

	public set<T = any>(key: string, data: T, override: boolean = true): void {

		if (this.cache.has(key) && !override) {
			throw new Error(`Data already exists for key '${key}'. Use a different key, delete the existing one first or mark override to true.`);
		}

		this.cache.set(key, data);
		this.cache$.next({ key: key, value: data });
	}

	public get<T = any>(key: string): T {
		return this.cache.get(key);
	}

	public getObservable<T = any>(key: string): Observable<T> {
		return of(this.get<T>(key));
	}

	public clear(key: string): void {
		this.cache.delete(key);
		this.cache$.next({ key: key, value: null });
	}

}
