type AuthUser = {
	id: string;
	email: string;
	password: string;
	isValidated: boolean;
};

type AuthCode = {
    id: string;
    userId: string;
    voided: boolean;
    expiresAt: Date;
}

interface AuthenticationService {
	
    /**
	 * Create a new user and insert it in the database
	 * @param email - The user's email address
	 * @param passwordHash - The hashed password to set
	 * @returns The user id
	 */
	createUser({ email, passwordHash }: { email: string, passwordHash: string }): Promise<string>;

    /**
	 * Update a user
     * @param id - The user's id
	 * @param email - An optional email to update
	 * @param passwordHash - An optional hashed password to update
	 * @param isValidated - An optional validation status to update
	 * @returns void
	 */
    updateUser ({ id, email, passwordHash, isValidated }: { id: string } & Partial<{ email: string, passwordHash: string, isValidated: boolean }>): Promise<void>;

    /**
     * Get a user by email or id
     * @param email - The user's email address 
     * @param id - The user's id
     * @returns The user or null if not found
     */
    getUser ({ email, id }: Partial<{ email: string, id: string }>): Promise<AuthUser | null>;
    

    /**
     * Create a validation code for a user
     * @param id - The user's id
     * @returns The validation code
     */
    createCodeForUser ({ userId }: { userId: string }): Promise<AuthCode>;
    
    /**
     * Update a user code
     * @param id - The code's id
     * @param voided - The code's void status
     * @returns void
     */
    updateCode ({ id, voided }: { id: string, voided: boolean }): Promise<void>;

    /**
     * Get a code by id
     * @param id - The code id to fetch
     * @returns The code or null if not found
     */
    getCode ({ id }: { id: string }): Promise<AuthCode | null>;
    
    /**
     * Get all valid codes for a user
     * @param id - The user's id
     * @returns The codes 
     */
    getCodesForUser ({ userId }: { userId: string }): Promise<AuthCode[]>;
}

export type { AuthCode, AuthenticationService, AuthUser };

