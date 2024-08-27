import { getTodos } from '$lib/server/data/todo';
import { toJson } from '$lib/server/helpers';
import { error, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (event) => {
	const user = event.locals.user;

	if (!user) {
		error(401, { message: 'Unauthorized' });
	}

	const result = await getTodos(user.id);
	return toJson(result);
};
