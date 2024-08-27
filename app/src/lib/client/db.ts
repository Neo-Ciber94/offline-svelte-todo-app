import { SqlJsDatabase } from '$lib/db/adapters/sql-js';
import migrationSql from '../../../migrations/001_initial.sql?raw';

type Migration = {
	id: number;
	hash: string;
};

let instance: Promise<SqlJsDatabase>;

export async function getDb() {
	if (instance) {
		return instance;
	}

	instance = new Promise<SqlJsDatabase>((resolve) => {
		const db = new SqlJsDatabase('data.db');
		checkMigrations(db).then(() => resolve(db));
	});

	return instance;
}

async function checkMigrations(db: SqlJsDatabase) {
	// Check for migrations

	await db.run(`CREATE TABLE IF NOT EXISTS __migration(
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        hash TEXT
    )`);

	await db.run('CREATE UNIQUE INDEX IF NOT EXISTS migration_hash_idx ON __migration(hash)');

	const migrationHash = await hashSha1(migrationSql);

	const exists = await db.first<Migration>('SELECT id, hash FROM __migration WHERE hash = :hash', {
		':hash': migrationHash
	});

	// If the migration do not exists, run the migration
	if (!exists) {
		console.log('🕒 Running migrations...');

		try {
			await db.run('BEGIN TRANSACTION');
			const parts = migrationSql.split('---breakpoint').map((x) => x.trim());

			for (const sql of parts) {
				console.log(`⌛ Running:\n ${sql}`);
				await db.run(sql);
			}

			// Save the hash
			await db.run('INSERT INTO __migration(hash) VALUES (:hash)', {
				':hash': migrationHash
			});

			await db.run('COMMIT TRANSACTION');
			console.log('✅ Applied migrations');
		} catch (err) {
			console.error(err);
			await db.run('ROLLBACK');
			console.log('❌ Failed to apply migrations');
		} 
	}
}

async function hashSha1(input: string) {
	const encoder = new TextEncoder();
	const data = encoder.encode(input);
	const hashBuffer = await crypto.subtle.digest('SHA-1', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
	return hashHex;
}
