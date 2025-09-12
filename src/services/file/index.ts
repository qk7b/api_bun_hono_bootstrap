import { type FileService, FileServiceProviders } from "./file.service";
import { S3FileService } from "./impl/s3_file.service";

function fileServiceFactory({
	provider = FileServiceProviders.s3ObjectStorage,
}: {
	provider?: FileServiceProviders;
}): FileService {
	switch (provider) {
		case FileServiceProviders.s3ObjectStorage:
			return new S3FileService();
		default:
			throw new Error("File service not found");
	}
}

export { fileServiceFactory, FileServiceProviders };
