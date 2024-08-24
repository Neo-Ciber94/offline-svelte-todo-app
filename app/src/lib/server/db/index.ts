import path from 'node:path';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

export const db = await open({
	filename: path.join(process.cwd(), 'data', 'database.db'),
	driver: sqlite3.Database
});
