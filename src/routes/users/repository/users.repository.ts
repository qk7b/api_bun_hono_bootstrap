import type { User } from "../users.type";

interface UsersRepository {
	/**
	 * Get a user by id
	 * @param id - The user's id
	 * @returns The user
	 */
	getById({ id }: { id: string }): Promise<User>;
}

export type { UsersRepository };
