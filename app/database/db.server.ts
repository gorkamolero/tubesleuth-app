import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import once from "lodash.once";

const connectionString = process.env.DATABASE_URL || "";
const client = postgres(connectionString, {
	prepare: false,
});

export const db = drizzle(client, { schema });

const doMigrate = true;

/**
 * Migrate the database on startup. prevent call multiple times.
 */
once(() => {
	if (doMigrate) {
		console.log("Migrating database...");
		migrate(db, { migrationsFolder: "drizzle" });
	}
})();
