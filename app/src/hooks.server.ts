import { building } from '$app/environment';
import { COOKIE_AUTH_TOKEN } from '$lib/common/constants';
import { getUserByToken } from '$lib/server';
import { redirect, type Cookies, type Handle } from '@sveltejs/kit';

const PUBLIC_ROUTES = ['/login', '/register'];

export const handle: Handle = async ({ event, resolve }) => {
	if (building) {
		return resolve(event);
	}

	const user = await getUserFromCookies(event.cookies);
	const pathname = event.url.pathname;
	event.locals.user = user;

	if (pathname.startsWith('/api')) {
		return resolve(event);
	}

	if (!user && !PUBLIC_ROUTES.some((p) => pathname.startsWith(p))) {
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
