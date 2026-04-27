import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// A Neon recomenda usar a URL de conexão diretamente
const sql = neon(process.env.POSTGRES_URL!);

export const db = drizzle(sql, { schema });
