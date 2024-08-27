import { SqlJsDatabase } from '$lib/db/adapters/sql-js';
import { inject } from '$lib/services/di';
import { UserService } from '$lib/services/user.service';
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

	instance = new Promise<SqlJsDatabase>((resolve, reject) => {
		const db = new SqlJsDatabase('data.db');
		checkMigrations(db)
			.then(() => resolve(db))
			.catch(reject);
	});

	return instance;
}

export async function recreateDatabase() {
	const db = await getDb();

	// We disable auto writes here
	await db.run('DROP TABLE __migration');
	await db.run('DROP TABLE todo');
	await db.run('DROP TABLE user');

	await checkMigrations(db);
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

		// We disable auto writes here
		db.autoWritable = false;

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

			// We manually write the database
			await db.saveDatabase();
			console.log('✅ Applied migrations');
		} catch (err) {
			console.error(err);
			await db.run('ROLLBACK');
			console.log('❌ Failed to apply migrations');
		} finally {
			db.autoWritable = true;
		}
	}

	// Try insert the current user in the database
	const userService = inject(UserService);
	const user = await userService.getCurrentUser();

	// Nothing to do if there is not user
	if (!user) {
		return;
	}

	// Insert the user and ignore if exists
	await db.run('INSERT OR IGNORE INTO user(id, username, created_at) VALUES (:id, :username, :created_at)', {
		':id': user.id,
		':username': user.username,
		':created_at': user.createdAt.getTime()
	});
}

async function hashSha1(input: string) {
	const encoder = new TextEncoder();
	const data = encoder.encode(input);
	const hashBuffer = await crypto.subtle.digest('SHA-1', data);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
	return hashHex;
}
