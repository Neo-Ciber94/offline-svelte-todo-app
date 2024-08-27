import type { User } from '$lib/common/schema';

export interface UserRepository {
	registerUser(username: string): Promise<User>;
	getUser(userId: string): Promise<User | null>;
	getUserByUsername(username: string): Promise<User | null>;
	generateUserToken(user: User): string;
	getUserByToken(authToken: string): Promise<User | null>;
}
