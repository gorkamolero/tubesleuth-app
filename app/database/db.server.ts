import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, notes, channels, videos, images, imageMaps } from "./schema";

const connectionString = process.env.DATABASE_URL || "";
const client = postgres(connectionString, {
	prepare: false,
});
export const db = drizzle(client);
export { users, notes, channels, videos, images, imageMaps };
