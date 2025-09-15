import * as path from "node:path";
import { db } from "./db";

async function initDatabase() {
	console.log("Initializing database...");

	try {
		// Read the schema file
		const schemaPath = path.join(process.cwd(), "src/db/schema.sql");

		// Execute the schema SQL
		console.log("Executing schema SQL...");
		await db.file(schemaPath);
		console.log("Database schema initialized successfully");
	} catch (error) {
		console.error("Failed to initialize database:", error);
		process.exit(1);
	}
}

// Run the initialization
initDatabase();
