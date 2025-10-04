type User = {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

interface UsersService {
  /**
   * Get a user by id
   * @param id - The user's id
   * @returns The user
   */
  getById({ id }: { id: string }): Promise<User | null>;
}

export { UsersService, type User };
