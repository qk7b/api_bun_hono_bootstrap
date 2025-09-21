import { db } from "../../../db/db";
import { FileService, UserFile } from "./file.service";

class PostgresFileService implements FileService {
  async getFileById({ id }: { id: string }): Promise<UserFile | null> {
    const [file] = await db`
            SELECT f.id, f.name, f."contentType", f.bucket, f."createdAt", f."updatedAt", f."public", uf."userId"
            FROM files f
            INNER JOIN user_files uf ON f.id = uf."fileId"
            WHERE f.id = ${id}
        `;
    if (!file) return null;
    return file;
  }
  async createFile({ file }: { file: UserFile }): Promise<string> {
    const [dbFile] = await db`
            INSERT INTO files (id, name, "contentType", bucket, "public")
            VALUES (${file.id}, ${file.name}, ${file.contentType}, ${file.bucket}, ${file.public})
            RETURNING id
        `;
    return dbFile.id;
  }
  async deleteFile({ fileId }: { fileId: string }): Promise<void> {
    await db`
            DELETE FROM files WHERE id = ${fileId}
        `.catch(() => {
      return;
    });
  }

  async linkFileToUser({
    fileId,
    userId,
  }: {
    fileId: string;
    userId: string;
  }): Promise<void> {
    await db`
            INSERT INTO user_files ("fileId", "userId")
            VALUES (${fileId}, ${userId})
        `.catch(() => {
      return;
    });
  }

  async getFilesForUser({ userId }: { userId: string }): Promise<UserFile[]> {
    const files = await db`
            SELECT f.id, f.name, f."contentType", f.bucket, f."public", f."createdAt", f."updatedAt", uf."userId"
            FROM files f
            INNER JOIN user_files uf ON f.id = uf."fileId"
            WHERE uf."userId" = ${userId}
        `;
    return files || [];
  }
}

export default PostgresFileService;
