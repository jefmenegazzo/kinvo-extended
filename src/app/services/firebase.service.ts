import { inject, Injectable } from "@angular/core";
import { doc, FieldValue, Firestore, increment, setDoc } from "@angular/fire/firestore";

// collection user_access
interface UserAccessCollection {
	email: string;
	accessCount?: FieldValue;
}

@Injectable({
	providedIn: "root"
})
export class FirebaseService {

	firestore: Firestore = inject(Firestore);

	async addUserAccess(data: UserAccessCollection): Promise<void> {
		data.accessCount = increment(1);
		const userRef = doc(this.firestore, "user_access", data.email);
		await setDoc(userRef, data, { merge: true });
	}
}
