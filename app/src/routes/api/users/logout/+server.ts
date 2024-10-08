import { COOKIE_AUTH_TOKEN } from '$lib/common/constants';
import { toJson } from '$lib/server/helpers';
import { redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
	const authToken = event.cookies.get(COOKIE_AUTH_TOKEN);

	if (!authToken) {
		return toJson(null, { status: 401 });
	}

	event.cookies.delete(COOKIE_AUTH_TOKEN, { path: '/' });
	redirect(302, '/login');
};
