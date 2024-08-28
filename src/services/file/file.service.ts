enum FileServiceProviders {
  s3ObjectStorage,
}

interface FileService {
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

  deleteFile: ({
    id,
    location,
  }: {
    id: string;
    location: string;
  }) => Promise<void>;

  readFile: ({
    id,
    location,
  }: {
    id: string;
    location: string;
  }) => Promise<Uint8Array | undefined>;
}

export { FileService, FileServiceProviders };
