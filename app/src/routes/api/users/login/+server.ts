import { COOKIE_AUTH_TOKEN } from '$lib/common/constants';
import { ApplicationError } from '$lib/common/error';
import { generateUserToken, getUserByUsername } from '$lib/server';
import { customJson } from '$lib/server/helpers';
import { error, isHttpError, type RequestHandler } from '@sveltejs/kit';
import * as devalue from 'devalue';
import { z } from 'zod';

const loginUserSchema = z.object({
	username: z.string()
});

export const POST: RequestHandler = async (event) => {
	const contents = await event.request.text();

	try {
		const json = devalue.parse(contents);
		const result = loginUserSchema.safeParse(json);

		if (!result.success) {
			const message = result.error.issues
				.map((issue) => `${issue.path}: ${issue.message}`)
				.join('\n');

			return error(400, { message });
		}

		const user = await getUserByUsername(result.data.username);

		if (!user) {
			error(404, { message: 'User not found' });
		}

		const authToken = await generateUserToken(user);
		const expires = new Date();
		expires.setDate(expires.getDate() + 30);

		event.cookies.set(COOKIE_AUTH_TOKEN, authToken, {
			path: '/',
			expires
		});

		return customJson(user);
	} catch (err) {
		if (isHttpError(err)) {
			throw err;
		}

		console.error(err);

		if (err instanceof ApplicationError) {
			error(err.status, err.message);
		}

		error(500, { message: 'Internal Error' });
	}
};
