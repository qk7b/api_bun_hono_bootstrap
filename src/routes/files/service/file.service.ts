type UserFile = {
  id: string;
  name: string;
  contentType: string;
  bucket: string;
  public: boolean;
  userId: string;
  createdAt: Date;
};
interface FileService {
  /**
   * Get a file by id
   * @param id - The file id
   * @returns The file or null if not found
   */
  getFileById({ id }: { id: string }): Promise<UserFile | null>;
  /**
   * Create a new file
   * @param file - The file to create
   * @returns The file id
   */
  createFile({ file }: { file: UserFile }): Promise<string>;
  /**
   * Delete a file
   * @param fileId - The file id to delete
   */
  deleteFile({ fileId }: { fileId: string }): Promise<void>;

  /**
   * Link a file to a user
   * @param fileId - The file id to link
   * @param userId - The user id to link the file to
   */
  linkFileToUser({
    fileId,
    userId,
  }: {
    fileId: string;
    userId: string;
  }): Promise<void>;

  /**
   * Get all files for a user
   * @param userId - The user id to get the files for
   * @returns The files for the user
   */
  getFilesForUser({ userId }: { userId: string }): Promise<UserFile[]>;
}

export { UserFile, type FileService };
