import { ApplicationError } from '$lib/common/error';
import type { User } from '$lib/common/schema';
import { db } from '$lib/server/db';
import type { UserRepository } from './user.repository';

type UserModel = {
	id: string;
	username: string;
	created_at: Date;
};

class ServerUserRepository implements UserRepository {
	async registerUser(username: string): Promise<User> {
		const alreadyExists = await db
			.get<{ count: number }>('SELECT COUNT(*) as count FROM user WHERE username = ?', [username])
			.then((result) => Boolean(result?.count));

		if (alreadyExists) {
			throw new ApplicationError(400, 'User already exists');
		}

		const user: User = {
			id: crypto.randomUUID(),
			createdAt: new Date(),
			username
		};

		await db.run(
			`INSERT INTO user(id, username, created_at) 
      VALUES (:id, :username, :created_at)`,
			{
				':id': user.id,
				':username': user.username,
				':created_at': user.createdAt.getTime()
			}
		);

		return user;
	}

	async getUser(userId: string): Promise<User | null> {
		const user = await db.get<UserModel>('SELECT * FROM user WHERE id = ?', [userId]);

		return user ? this.mapToUser(user) : null;
	}

	async getUserByUsername(username: string): Promise<User | null> {
		const user = await db.get<UserModel>('SELECT * FROM user WHERE username = ?', [username]);

		return user ? this.mapToUser(user) : null;
	}

	generateUserToken(user: User): string {
		return btoa(user.id);
	}

	async getUserByToken(authToken: string): Promise<User | null> {
		const userId = atob(authToken);
		return await this.getUser(userId);
	}

	private mapToUser(model: UserModel): User {
		return {
			id: model.id,
			username: model.username,
			createdAt: new Date(model.created_at)
		};
	}
}

export const userRepository = new ServerUserRepository();
