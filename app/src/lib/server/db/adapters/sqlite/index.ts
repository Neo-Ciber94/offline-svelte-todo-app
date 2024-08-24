import type * as sqlite3 from 'sqlite3';
import { SqliteDatabaseAdapter } from '..';
import type { Database } from 'sqlite';

export class SqliteDatabase extends SqliteDatabaseAdapter {
	#db: Database<sqlite3.Database, sqlite3.Statement>;

	constructor(db: Database<sqlite3.Database, sqlite3.Statement>) {
		super();
		this.#db = db;
	}

	async first<T extends Record<string, unknown>>(
		sql: string,
		params?: Record<string, unknown>
	): Promise<T | undefined> {
		const result = await this.#db.get<T>(sql, params);
		return result;
	}

	async all<T extends unknown[]>(sql: string, params?: Record<string, unknown>): Promise<T[]> {
		const result = await this.#db.all<T[]>(sql, params);
		return result;
	}

	async run(sql: string, params?: Record<string, unknown>): Promise<void> {
		await this.#db.run(sql, params);
	}
}
