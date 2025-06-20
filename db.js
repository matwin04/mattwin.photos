import postgres from "postgres";
import dotenv from "dotenv";
dotenv.config();
const connectionString = process.env.POSTGRES_URL;
console.log(connectionString)
const sql = postgres(connectionString);
async function setupDB() {
    console.log("DB Connected");
    console.log("Database Connected");
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS cameras (
                id SERIAL PRIMARY KEY,
                make TEXT NOT NULL,
                model TEXT NOT NULL,
                type TEXT,
                year TEXT,
                format TEXT
            )`;
        await sql`
            CREATE TABLE IF NOT EXISTS photos (
                id SERIAL PRIMARY KEY,
                immich_id TEXT NOT NULL,
                filename TEXT NOT NULL,
                camera TEXT,
                date TIMESTAMP,
                description TEXT
            )`;
        } catch (error) {
            console.log(error);
    }
}
export { sql, setupDB };