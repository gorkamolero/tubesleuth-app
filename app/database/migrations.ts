import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";

const connectionString = process.env.DATABASE_URL || "";

const migrationsClient = postgres(connectionString, {
	prepare: false,
	max: 1,
});
const db = drizzle(migrationsClient);
const migrateF = async () => {
	await migrate(db, { migrationsFolder: "./app/database/migrations/" });
};
