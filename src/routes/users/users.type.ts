// Define types for our database entities
type User = {
	id: string;
	email: string;
	isValidated: boolean;
	createdAt: Date;
	updatedAt: Date;
};

export type { User };
