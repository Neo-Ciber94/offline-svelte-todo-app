import type { User } from '$lib/common/schema';
import { userRepository } from '$lib/dal/user.server';

export async function registerUser(username: string) {
	return userRepository.registerUser(username);
}

export async function getUser(userId: string) {
	return userRepository.getUser(userId);
}

export async function getUserByUsername(username: string) {
	return userRepository.getUserByUsername(username);
}

export async function generateUserToken(user: User) {
	const authToken = btoa(user.id);
	return authToken;
}

export async function getUserByToken(authToken: string) {
	return userRepository.getUserByToken(authToken);
}
