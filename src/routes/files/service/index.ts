import { FileObjectService, FileServiceProviders } from "./file_object.service";
import PostgresFileService from "./pg_file.service";
import { S3FileService } from "./s3_file_object.service";

function fileObjectServiceFactory({
  provider = FileServiceProviders.s3ObjectStorage,
}: {
  provider?: FileServiceProviders;
}): FileObjectService {
  switch (provider) {
    case FileServiceProviders.s3ObjectStorage:
      return new S3FileService();
    default:
      throw new Error("File service not found");
  }
}

const filesService = new PostgresFileService();

export { fileObjectServiceFactory, FileServiceProviders, filesService };
