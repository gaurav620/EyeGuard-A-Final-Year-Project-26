import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const pool = new Pool({
  host: "13.228.184.177",
  port: 5432,
  database: "neondb",
  user: "neondb_owner",
  password: "npg_oihWucE6Ifv2",
  ssl: {
    rejectUnauthorized: false,
    servername: "ep-billowing-queen-a1uddhps-pooler.ap-southeast-1.aws.neon.tech",
  },
  max: 5,
  connectionTimeoutMillis: 30000,
});

export const db = drizzle(pool, { schema });
