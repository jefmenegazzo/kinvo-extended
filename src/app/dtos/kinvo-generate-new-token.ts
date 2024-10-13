export interface KinvoGenerateNewToken {
	uid: string;
	email: string | null;
	token: string;
	expiringDateTime: string;
}
