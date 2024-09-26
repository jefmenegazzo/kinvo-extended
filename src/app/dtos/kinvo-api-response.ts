export interface KinvoApiResponse<T> {
	success: boolean;
	data: T;
	error: string | null;
}
