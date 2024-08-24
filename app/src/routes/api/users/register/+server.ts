import { COOKIE_AUTH_TOKEN } from '$lib/common/constants';
import { ApplicationError } from '$lib/common/error';
import { registerUser, generateUserToken } from '$lib/server/data/user';
import { customJson } from '$lib/server/helpers';
import { error, isHttpError, type RequestHandler } from '@sveltejs/kit';
import * as devalue from 'devalue';
import { z } from 'zod';

const registerUserSchema = z.object({
	username: z.string().trim().min(3)
});

export const POST: RequestHandler = async (event) => {
	const contents = await event.request.text();

	try {
		const json = devalue.parse(contents);
		const result = registerUserSchema.safeParse(json);

		if (!result.success) {
			const message = result.error.issues
				.map((issue) => `${issue.path}: ${issue.message}`)
				.join('\n');

			return error(400, { message });
		}

		const user = await registerUser(result.data.username);
		const authToken = await generateUserToken(user);

		const expires = new Date();
		expires.setDate(expires.getDate() + 30);

		event.cookies.set(COOKIE_AUTH_TOKEN, authToken, {
			path: '/',
			expires
		});

		return customJson(user, {
			status: 201
		});
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
