import type { relations } from './relations.js';
import type { NodeSQLiteDatabase } from 'drizzle-orm/node-sqlite';

export type Database = NodeSQLiteDatabase<typeof relations>;
