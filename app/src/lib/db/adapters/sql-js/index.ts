import { Mutex } from '$lib/common/mutex';
import { SqliteDatabaseAdapter } from '..';
import initSqlJs, { type Database, type QueryExecResult } from 'sql.js';
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
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const queryResult = db.exec(sql, params as Record<string, any>);
			const first = queryResult[0];

			await this.#tryWriteDatabase();

			if (first == null) {
				return undefined;
			}

			const row = this.#mapQueryResult([first])[0];
			return row as T;
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
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const queryResult = db.exec(sql, params as Record<string, any>);
			const rows = this.#mapQueryResult(queryResult);

			await this.#tryWriteDatabase();
			return rows as T[];
		} finally {
			release();
		}
	}

	async run(sql: string, params?: Record<string, unknown>): Promise<void> {
		const db = await this.#db;

		const release = await this.#mutex.lock();

		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
		console.log('write db');
	}

	#mapQueryResult(rows: QueryExecResult[]) {
		const values: Record<string, unknown>[] = [];

		for (const [rowIdx, row] of rows.entries()) {
			const obj: Record<string, unknown> = {};
			const columns = row.columns;
			const rowValues = row.values[rowIdx];

			for (const [idx, col] of columns.entries()) {
				obj[col] = rowValues[idx];
			}

			values.push(obj);
		}

		return values;
	}
}
