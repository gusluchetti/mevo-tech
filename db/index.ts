import { drizzle } from 'drizzle-orm/libsql';
import * as schema from "./schema"

export const db = drizzle(process.env.DB_FILE_NAME!, { schema });

// TODO: add seeding with drizzle
// db.run(`insert into buyers (name, cpf) values ('gustavo', '123');`)
