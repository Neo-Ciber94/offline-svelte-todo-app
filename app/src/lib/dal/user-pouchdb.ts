import PouchDB from 'pouchdb';
import type { User } from '$lib/common/schema';
import { ApplicationError } from '$lib/common/error';
import type { UserRepository } from './user.repository';

type UserModel = {
	_id: string;
	username: string;
	createdAt: number;
};

export class PouchDbUserRepository implements UserRepository {
	constructor(private readonly db: PouchDB.Database<UserModel>) {}

	async registerUser(username: string): Promise<User> {
		// Check if user already exists
		const existingUser = await this.db.find({
			selector: { username },
			limit: 1
		});

		if (existingUser.docs.length > 0) {
			throw new ApplicationError(400, 'User already exists');
		}

		// Create new user
		const user: User = {
			id: crypto.randomUUID(),
			createdAt: new Date(),
			username
		};

		// Insert the new user into the database
		await this.db.put(userToModel(user));

		return user;
	}

	async getUser(userId: string): Promise<User | null> {
		const doc = await this.db.get<User>(userId);
		return mapToUser(doc);
	}

	async getUserByUsername(username: string): Promise<User | null> {
		const result = await this.db.find({
			selector: { username },
			limit: 1
		});

		if (result.docs.length === 0) {
			return null;
		}

		return mapToUser(result.docs[0]);
	}

	generateUserToken(user: User): string {
		return btoa(user.id);
	}

	async getUserByToken(authToken: string): Promise<User | null> {
		const userId = atob(authToken);
		return await this.getUser(userId);
	}
}

function userToModel(user: User): UserModel {
	return {
		_id: user.id,
		username: user.username,
		createdAt: user.createdAt.getTime()
	};
}

function mapToUser(doc: UserModel): User {
	return {
		id: doc._id,
		username: doc.username,
		createdAt: new Date(doc.createdAt)
	};
}
