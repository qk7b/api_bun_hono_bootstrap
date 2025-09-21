import {
  fileObjectServiceFactory,
  FileServiceProviders,
  filesService,
} from "./service";
import { UserFile } from "./service/file.service";

const fileObjectService = fileObjectServiceFactory({
  provider: FileServiceProviders.s3ObjectStorage,
});

class FilesRepository {
  /**
   * Create a file in the database and upload it to the file storage
   * @param userId the user id to link the file to
   * @param file the file to create
   * @returns the file id
   */
  async createFile({
    userId,
    file,
    buffer,
  }: {
    userId: string;
    file: UserFile;
    buffer: Buffer;
  }): Promise<string> {
    //  First, create the file in the database
    const fileId = await filesService.createFile({ file });

    // Then, upload the file to storage
    await fileObjectService.saveFile({
      id: fileId,
      location: file.bucket,
      type: file.contentType,
      buffer,
    });

    // Then, link the file to the user
    await filesService.linkFileToUser({ fileId, userId });
    return fileId;
  }

  /**
   * Get all files for a user
   * @param userId the user id to get the files for
   * @returns the files for the user
   */
  async getFilesForUser({ userId }: { userId: string }): Promise<UserFile[]> {
    return filesService.getFilesForUser({ userId });
  }

  /**
   * Get file metadata
   * @param fileId the file id
   * @returns the file metadata or null if not found
   */
  async getFileMetadata({
    fileId,
  }: {
    fileId: string;
  }): Promise<UserFile | null> {
    return filesService.getFileById({ id: fileId });
  }

  /**
   * Get a file by its id
   * @param id the file id
   * @returns the file or null if not found
   */
  async getFile({ file }: { file: UserFile }): Promise<Uint8Array | null> {
    return fileObjectService
      .readFile({ id: file.id, location: file.bucket })
      .then((buffer) => {
        return buffer || null;
      });
  }

  /**
   * Delete a file from the database and the file storage
   * @param file the file to delete
   * @returns void
   */
  async deleteFile({ file }: { file: UserFile }): Promise<void> {
    // First, delete the file from storage
    await fileObjectService.deleteFile({ id: file.id, location: file.bucket });

    // Then, delete the file from the database (it will delete the link between the file and the user)
    await filesService.deleteFile({ fileId: file.id });
  }
}

export default FilesRepository;
