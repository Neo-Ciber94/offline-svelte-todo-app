import { Mutex } from '$lib/common/mutex';
import { SqliteDatabaseAdapter } from '..';
import initSqlJs, { type Database } from 'sql.js';
import { IndexDbSqlJsStorage, type SqlJsStorage } from './storage';

export class SqlJsDatabase extends SqliteDatabaseAdapter {
	#db: Promise<Database>;
	#mutex = new Mutex();
	#storage: SqlJsStorage;
	#dbName: string;
	#canWrite = true;

	constructor(dbName: string, storage: SqlJsStorage = new IndexDbSqlJsStorage()) {
		super();

		this.#dbName = dbName;
		this.#storage = storage;
		this.#db = SqlJsDatabase.#initDatabase(dbName, storage);
	}

	static async #initDatabase(dbName: string, storage: SqlJsStorage) {
		const buffer = await storage.read(dbName);
		const SQL = await initSqlJs({
			locateFile: (file) => `https://sql.js.org/dist/${file}`
		});

		return new SQL.Database(buffer);
	}

	get autoWritable() {
		return this.#canWrite;
	}

	set autoWritable(value: boolean) {
		this.#canWrite = value;
	}

	async first<T extends Record<string, unknown>>(
		sql: string,
		params?: Record<string, unknown>
	): Promise<T | undefined> {
		const db = await this.#db;

		const release = await this.#mutex.lock();

		try {
			const rows = await this.#queryAndGetResult<T>(db, sql, params);
			await this.#tryWriteDatabase();
			return rows[0];
		} finally {
			release();
		}
	}

	async all<T extends Record<string, unknown>>(
		sql: string,
		params?: Record<string, unknown>
	): Promise<T[]> {
		const db = await this.#db;

		const release = await this.#mutex.lock();

		try {
			const rows = await this.#queryAndGetResult<T>(db, sql, params);
			await this.#tryWriteDatabase();
			return rows;
		} finally {
			release();
		}
	}

	async run(sql: string, params?: Record<string, unknown>): Promise<void> {
		const db = await this.#db;

		const release = await this.#mutex.lock();

		try {
			db.run(sql, params as Record<string, any>);
			await this.#tryWriteDatabase();
		} finally {
			release();
		}
	}

	async deleteDatabase() {
		const exists = await this.#storage.read(this.#dbName);

		if (!exists) {
			return false;
		}

		const release = await this.#mutex.lock();

		try {
			await this.#storage.remove(this.#dbName);
			this.#db = Promise.reject(new Error('Database was deleted'));

			return true;
		} finally {
			release();
		}
	}

	async #tryWriteDatabase() {
		const db = await this.#db;

		if (db.getRowsModified() > 0) {
			await this.saveDatabase();
		}
	}

	async saveDatabase() {
		if (!this.#canWrite) {
			return;
		}

		const db = await this.#db;
		const buffer = db.export();
		await this.#storage.write(this.#dbName, buffer);
	}

	#queryAndGetResult<T>(db: Database, sql: string, params?: Record<string, unknown>) {
		return new Promise<T[]>((resolve, reject) => {
			const data: T[] = [];

			try {
				db.each(
					sql,
					params as Record<string, any>,
					(row) => data.push(row as T),
					() => resolve(data)
				);
			} catch (err) {
				reject(err);
			}
		});
	}
}
