import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { stream } from "hono/streaming";
import { v4 } from "uuid";

import { createFileSchema } from "./files.schema";
import type { AppFile } from "./files.type";
import {
	FileNotFoundError,
	PostgresFilesRepository,
} from "./repository/pg_files.repository";
import { fileServiceFactory, FileServiceProviders } from "./service";

const filesRoute = new Hono();
const filesRepository = new PostgresFilesRepository();
const fileService = fileServiceFactory({
	provider: FileServiceProviders.s3ObjectStorage,
});

// Route are secured by jwt
filesRoute.use(
	"/*",
	jwt({
		secret: process.env.JWT_SECRET as string,
	}),
);

/**
 * Get file
 */
filesRoute.get("/:fileId", async (c) => {
	const fileId = c.req.param("fileId");
	try {
		const dbFile = await filesRepository.getFileById({ id: fileId });

		const fileData: Uint8Array | undefined = await fileService.readFile({
			id: fileId,
			location: dbFile.bucket,
		});

		if (!fileData) {
			return c.json({ error: "File not found in storage" }, 404);
		}

		c.header("Content-Type", dbFile.contentType);

		return stream(c, async (stream) => {
			// Write a process to be executed when aborted.
			stream.onAbort(() => {
				console.debug("File reading aborted");
			});
			// Write a Uint8Array.
			await stream.write(fileData);
		});
	} catch (error) {
		console.error({
			message: "Failed to read file",
			details: error,
		});
		if (error instanceof FileNotFoundError) {
			return c.json({ error: "File not found" }, 404);
		}
		return c.json({ error: "Failed to read file", details: error }, 500);
	}
});

/**
 * Create a new batch of icons
 */
filesRoute.post("/", zValidator("json", createFileSchema), async (c) => {
	// @ts-expect-error next-line
	const fileData = c.req.valid("form");
	const bucketName =
		fileData.bucketName ?? (process.env.S3_DEFAULT_BUCKET as string);
	try {
		// Save in database first
		const fileId = v4();
		const fileType = fileData.file.type;
		const dbFile = await filesRepository.createFile({
			file: {
				id: fileId,
				name: fileData.file.name,
				bucket: bucketName,
				contentType: fileType,
			} as AppFile,
		});
		if (!dbFile) {
			return c.json({ error: "Failed to create file" }, 500);
		}

		const fileBuffer = Buffer.from(await fileData.file.arrayBuffer());
		await fileService.saveFile({
			id: fileId,
			location: bucketName,
			type: fileType,
			buffer: fileBuffer,
		});
		return c.json({ id: fileId }, 201);
	} catch (error) {
		console.error(error);
		return c.json({ error: "Failed to upload file", details: error }, 500);
	}
});

filesRoute.delete("/:fileId", async (c) => {
	const fileId = c.req.param("fileId");
	return filesRepository
		.getFileById({ id: fileId })
		.then((file) => {
			// Delete on storage
			return fileService.deleteFile({
				id: fileId,
				location: file.bucket,
			});
		})
		.then(() => {
			// Delete from database
			return filesRepository.deleteFile({ fileId });
		})
		.then(() => {
			return c.json(204);
		})
		.catch((error) => {
			console.error({
				message: "Failed to delete file",
				details: error,
			});
			if (error instanceof FileNotFoundError) {
				return c.json({ error: "File not found" }, 404);
			}
			return c.json({ error: "Failed to delete file" }, 500);
		});
});

export default filesRoute;
