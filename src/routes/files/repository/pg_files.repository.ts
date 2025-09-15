import { db } from "../../../db/db";
import type { AppFile } from "../files.type";
import type { FilesRepository } from "./files.repository";

class FileNotFoundError extends Error {
	constructor() {
		super("File not found");
		this.name = "FileNotFoundError";
	}
}

class PostgresFilesRepository implements FilesRepository {
	async getFileById({ id }: { id: string }): Promise<AppFile> {
		const [file] = await db`
            SELECT f.id, f.name, f."contentType", f.bucket, f."createdAt", f."updatedAt"
            FROM files f WHERE f.id = ${id}
        `;
		if (!file) throw new FileNotFoundError();
		return file;
	}
	async createFile({ file }: { file: AppFile }): Promise<string> {
		const [dbFile] = await db`
            INSERT INTO files (id, name, "contentType", bucket)
            VALUES (${file.id}, ${file.name}, ${file.contentType}, ${file.bucket})
            RETURNING id
        `;
		return dbFile.id;
	}
	async deleteFile({ fileId }: { fileId: string }): Promise<void> {
		await db`
            DELETE FROM files WHERE id = ${fileId}
        `.catch(() => {
			throw new FileNotFoundError();
		});
	}
}

export { FileNotFoundError, PostgresFilesRepository };
