import type { AppFile } from "../files.type";

interface FilesRepository {
	/**
	 * Get a file by id
	 * @param id - The file id
	 * @returns The file
	 */
	getFileById({ id }: { id: string }): Promise<AppFile>;
	/**
	 * Create a new file
	 * @param file - The file to create
	 * @returns The file id
	 */
	createFile({ file }: { file: AppFile }): Promise<string>;
	/**
	 * Delete a file
	 * @param fileId - The file id to delete
	 */
	deleteFile({ fileId }: { fileId: string }): Promise<void>;
}

export type { FilesRepository };
