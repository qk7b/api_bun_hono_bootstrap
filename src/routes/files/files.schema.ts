import { z } from "zod";

const createFileSchema = z.object({
	bucketName: z.string().optional(),
	file: z.instanceof(File),
});

export { createFileSchema };
