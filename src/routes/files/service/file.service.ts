enum FileServiceProviders {
	s3ObjectStorage,
}

interface FileService {
	// Save a file in the storage
	// @param id - The id of the file
	// @param location - The location of the file (bucket name, folder name)
	// @param type - The type of the file (mime type)
	// @param buffer - The buffer of the file
	saveFile: ({
		id,
		location,
		type,
		buffer,
	}: {
		id: string;
		location: string;
		type: string;
		buffer: Buffer;
	}) => Promise<void>;

	// Delete a file from the storage
	// @param id - The id of the file
	// @param location - The location of the file (bucket name, folder name)
	deleteFile: ({
		id,
		location,
	}: {
		id: string;
		location: string;
	}) => Promise<void>;

	// Read a file from the storage
	// @param id - The id of the file
	// @param location - The location of the file (bucket name, folder name)
	readFile: ({
		id,
		location,
	}: {
		id: string;
		location: string;
	}) => Promise<Uint8Array | undefined>;
}

export { type FileService, FileServiceProviders };
