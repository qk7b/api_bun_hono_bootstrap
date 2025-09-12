import { zValidator } from "@hono/zod-validator";
import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { stream } from "hono/streaming";
import { v4 } from "uuid";

import { fileServiceFactory, FileServiceProviders } from "../../services/file";
import { createFileSchema } from "./files.schema";

const filesRoute = new Hono();
const prisma = new PrismaClient();
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
		const dbFile = await prisma.files.findUnique({
			where: { id: fileId },
		});

		if (!dbFile) {
			return c.json({ error: "File not found" }, 404);
		}

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
		console.error(error);
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
		const dbFile = await prisma.files.create({
			data: {
				id: fileId,
				name: fileData.file.name,
				bucket: bucketName,
				contentType: fileType,
			},
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

	try {
		const dbFile = await prisma.files.findUnique({
			where: { id: fileId },
		});
		if (!dbFile) {
			return c.json({ error: "File not found" }, 404);
		}

		// First, delete from storage
		await fileService.deleteFile({
			id: fileId,
			location: dbFile.bucket,
		});
		// Then, delete from database
		await prisma.files.delete({ where: { id: fileId } });
		return c.status(204);
	} catch (error) {
		console.error(error);
		return c.json({ error: "Failed to delete icon" }, 500);
	}
});

export default filesRoute;
