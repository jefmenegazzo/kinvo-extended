import { Injectable } from "@angular/core";
import { doc, FieldValue, Firestore, increment, setDoc } from "@angular/fire/firestore";

// collection user_access
interface UserAccessCountCollection {
	email: string;
	accessCount?: FieldValue;
}

@Injectable({
	providedIn: "root"
})
export class FirebaseService {

	constructor(
		private readonly firestore: Firestore
	) { }

	async incrementUserAccessCount(email: string): Promise<void> {
		const data: UserAccessCountCollection = { email, accessCount: increment(1) };
		const userRef = doc(this.firestore, "user_access", data.email);
		await setDoc(userRef, data, { merge: true });
	}
}
