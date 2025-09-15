type AuthValidationCode = {
	id: string;
	userId: string;
	expiresAt: Date;
	expired: boolean;
};

export type { AuthValidationCode };
