import { Injectable } from "@angular/core";
import { DBSchema, IDBPDatabase, openDB } from "idb";

interface EncryptionDBSchema extends DBSchema {
	keys: {
		key: string;
		value: { id: string; key: JsonWebKey };
	};
}

@Injectable({
	providedIn: "root",
})
export class SessionService {

	database: string = "KinvoExtendedDB";
	databaseVersion: number = 1;

	public async initDB() {

		const upgrade = async (db: IDBPDatabase<EncryptionDBSchema>) => {

			if (!db.objectStoreNames.contains("keys")) {
				db.createObjectStore("keys", { keyPath: "id" });
			}
		};

		return await openDB<EncryptionDBSchema>(this.database, this.databaseVersion, { upgrade });
	}

	public async generateAndStoreCryptoKey() {

		const key = await crypto.subtle.generateKey(
			{ name: "AES-GCM", length: 256 },
			true, // chave pode ser exportada
			["encrypt", "decrypt"]
		);

		// Salvar a chave no IndexedDB
		const db = await this.initDB();
		const exportedKey = await crypto.subtle.exportKey("jwk", key);
		await db.put("keys", { id: "encryptionKey", key: exportedKey });

		return key;
	}

	public async loadCryptoKey() {

		const db = await this.initDB();
		const storedKey = await db.get("keys", "encryptionKey");

		if (!storedKey) {
			throw new Error("Chave de criptografia não encontrada no IndexedDB.");
		}

		return await crypto.subtle.importKey(
			"jwk",
			storedKey.key,
			{ name: "AES-GCM" },
			true,
			["encrypt", "decrypt"]
		);
	}

	public async encryptAndStoreData(key: CryptoKey, payload: object) {

		const data = JSON.stringify(payload);
		const encoder = new TextEncoder();
		const encodedData = encoder.encode(data);

		// Geração de um IV aleatório para o AES-GCM
		const iv = crypto.getRandomValues(new Uint8Array(12));

		// Criptografar os dados
		const encryptedData = await crypto.subtle.encrypt(
			{ name: "AES-GCM", iv: iv },
			key,
			encodedData
		);

		// Armazenar o IV e os dados criptografados no localStorage (convertendo para base64)
		localStorage.setItem("encryptedData", btoa(String.fromCharCode(...new Uint8Array(encryptedData))));
		localStorage.setItem("iv", btoa(String.fromCharCode(...iv)));
	}

	public async decryptDataFromStorage(key: CryptoKey) {

		const encryptedDataStr = localStorage.getItem("encryptedData");
		const ivStr = localStorage.getItem("iv");

		if (!encryptedDataStr || !ivStr) {
			throw new Error("Dados criptografados ou IV não encontrados no localStorage.");
		}

		// Converter de volta os dados armazenados (de base64 para Uint8Array)
		const encryptedData = Uint8Array.from(atob(encryptedDataStr), c => c.charCodeAt(0));
		const iv = Uint8Array.from(atob(ivStr), c => c.charCodeAt(0));

		// Descriptografar os dados usando a chave e o IV
		const decryptedData = await crypto.subtle.decrypt(
			{ name: "AES-GCM", iv: iv },
			key,
			encryptedData
		);

		const decoder = new TextDecoder();
		const data = decoder.decode(decryptedData);
		const payload = JSON.parse(data);
		return payload;
	}

	public async isEncryptedDataInStorage() {
		const db = await this.initDB();
		const storedKey = await db.get("keys", "encryptionKey");
		return !!localStorage.getItem("encryptedData") && !!localStorage.getItem("iv") && !!storedKey;
	}

	public async clearEncryptedDataFromStorage() {

		localStorage.removeItem("encryptedData");
		localStorage.removeItem("iv");

		const db = await this.initDB();
		await db.clear("keys");
	}
}
