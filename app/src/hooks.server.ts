import { COOKIE_AUTH_TOKEN } from '$lib/common/constants';
import { getUserByToken } from '$lib/server';
import { redirect, type Cookies, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const user = await getUserFromCookies(event.cookies);
	event.locals.user = user;

	if (event.url.pathname.startsWith('/api')) {
		return resolve(event);
	}

	if (!user && !event.url.pathname.startsWith('/login')) {
		redirect(302, '/login');
	}

	return await resolve(event);
};

async function getUserFromCookies(cookies: Cookies) {
	const authToken = cookies.get(COOKIE_AUTH_TOKEN);

	if (!authToken) {
		return null;
	}

	return getUserByToken(authToken);
}
