import path from 'node:path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { SqliteDatabase } from '$lib/db/adapters/sqlite';

export const client = await open({
	filename: path.join(process.cwd(), 'data', 'database.db'),
	driver: sqlite3.Database
});

export const db = new SqliteDatabase(client)