export interface KinvoPortfolioGoalStatus {
	id: number;
	portfolioId: number;
	userId: number;
	targetAmount: number;
	targetDate: string;
	equity: number;
	firstApplicationDate: string;
	goalPercentage: number;
	isAchieved: boolean;
	achievementDate: string | null;
}
