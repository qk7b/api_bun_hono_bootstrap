import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { stream } from "hono/streaming";

import FilesRepository from "./files.repository";
import { createFileSchema } from "./files.schema";
import { UserFile } from "./service/file.service";

const filesRoute = new Hono();
const filesRepository = new FilesRepository();

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
  const { id: userId } = c.get("jwtPayload") as { id: string };
  const metadata = await filesRepository.getFileMetadata({ fileId });

  if (!metadata) {
    return c.json({ error: "File not found" }, 404);
  }

  if (metadata.public === false && metadata.userId !== userId) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const fileData: Uint8Array | null = await filesRepository.getFile({
    file: metadata,
  });

  if (!fileData) {
    return c.json({ error: "File not found in storage" }, 404);
  }

  c.header("Content-Type", metadata.contentType);

  return stream(c, async (stream) => {
    // Write a process to be executed when aborted.
    stream.onAbort(() => {
      console.debug("File reading aborted");
    });
    // Write a Uint8Array.
    await stream.write(fileData);
  });
});

/**
 * Create a file in storage
 */
filesRoute.post("/", zValidator("json", createFileSchema), async (c) => {
  // @ts-expect-error next-line
  const fileData = c.req.valid("form");
  const { id: userId } = c.get("jwtPayload") as { id: string };
  const bucketName =
    fileData.bucketName ?? (process.env.S3_DEFAULT_BUCKET as string);
  const fileType = fileData.file.type;
  const fileId = await filesRepository.createFile({
    userId,
    file: {
      name: fileData.file.name,
      bucket: bucketName,
      contentType: fileType,
    } as UserFile,
    buffer: Buffer.from(await fileData.file.arrayBuffer()),
  });

  if (!fileId) {
    return c.json({ error: "Failed to create file" }, 500);
  }
  return c.json({ id: fileId }, 201);
});

filesRoute.delete("/:fileId", async (c) => {
  const fileId = c.req.param("fileId");
  const { id: userId } = c.get("jwtPayload") as { id: string };

  // Check if the file belongs to the user
  const file = await filesRepository.getFileMetadata({ fileId });
  if (!file || file.userId !== userId) {
    return c.json({ error: "File not found" }, 404);
  }

  await filesRepository.deleteFile({ file });
  return c.status(204);
});

export default filesRoute;
