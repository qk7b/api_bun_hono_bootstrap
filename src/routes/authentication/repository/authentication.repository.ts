type AuthUser = {
	id: string;
	email: string;
	password: string;
	isValidated: boolean;
};

interface AuthenticationRepository {
	/**
	 * Create a validation or reset code for a user
	 * @param email - The user's email address
	 * @returns The reset code
	 */
	createCodeForUser({ email }: { email: string }): Promise<string>;

	/**
	 * Resets the user's password.
	 * @param code - The reset verification code
	 * @param newPasswordHash - The new password to set
	 */
	resetPassword({
		code,
		newPasswordHash,
	}: {
		code: string;
		newPasswordHash: string;
	}): Promise<void>;

	/**
	 * Get the password for a user.
	 * @param email - The user's email address
	 * @returns The hashed password as a string
	 */
	passwordForUser({ email }: { email: string }): Promise<string>;

	/**
	 * Create a new user and insert it in the database
	 * @param email - The user's email address
	 * @param passwordHash - The hashed password to set
	 * @returns The user id
	 */
	createUser({
		email,
		passwordHash,
	}: Partial<{
		email: string;
		passwordHash: string;
	}>): Promise<string>;

	/**
	 * Validate a user
	 * @param code - The validation code
	 */
	validateUser({ code }: { code: string }): Promise<void>;

	/**
	 * Get a user by email
	 * @param email - The user's email address
	 * @returns The user
	 */
	getUser({ email }: { email: string }): Promise<AuthUser>;
}

export type { AuthenticationRepository, AuthUser };
