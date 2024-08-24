import { COOKIE_AUTH_TOKEN } from '$lib/common/constants';
import { getUserByToken } from '$lib/server/data/user';
import { customJson } from '$lib/server/helpers';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
	const authToken = event.cookies.get(COOKIE_AUTH_TOKEN);

	if (!authToken) {
		return customJson(null, { status: 401 });
	}

	const result = await getUserByToken(authToken);
	return customJson(result);
};
