import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import type { FileObjectService } from "./file_object.service";

class S3FileService implements FileObjectService {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: "auto",
      forcePathStyle: true,
      endpoint: process.env.S3_URL as string,
      credentials: {
        accessKeyId: process.env.S3_USERNAME as string,
        secretAccessKey: process.env.S3_PASSWORD as string,
      },
    });
  }

  async saveFile({
    id,
    location,
    type,
    buffer,
  }: {
    id: string;
    location: string;
    type: string;
    buffer: Buffer;
  }): Promise<void> {
    const params = {
      Bucket: location,
      Key: id,
      Body: buffer,
      ContentType: type,
    };

    try {
      const command = new PutObjectCommand(params);
      await this.s3Client.send(command);
    } catch (error) {
      console.error("Error saving file to S3:", error);
      throw error;
    }
  }

  async readFile({
    id,
    location,
  }: {
    id: string;
    location: string;
  }): Promise<Uint8Array | undefined> {
    const params = {
      Bucket: location,
      Key: id,
    };
    try {
      const command = new GetObjectCommand(params);
      const object = await this.s3Client.send(command);
      const fileBytes = await object.Body?.transformToByteArray();
      return fileBytes;
    } catch (error) {
      console.error("Error reading file from S3:", error);
      throw error;
    }
  }

  async deleteFile({
    id,
    location,
  }: {
    id: string;
    location: string;
  }): Promise<void> {
    const params = {
      Bucket: location,
      Key: id,
    };
    try {
      const command = new DeleteObjectCommand(params);
      await this.s3Client.send(command);
    } catch (error) {
      console.error("Error deleting file from S3:", error);
      throw error;
    }
  }
}

export { S3FileService };
