import { toJson } from '$lib/server/helpers';
import { error, isHttpError, type RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';
import * as devalue from 'devalue';
import { createTodoSchema } from '$lib/common/schema';
import { createTodo, getTodos } from '$lib/server/data/todo';

const getAllSchema = z.object({
	done: z
		.string()
		.optional()
		.catch(() => undefined)
		.transform((x) => (x == null ? undefined : x === 'true')),
	search: z
		.string()
		.optional()
		.catch(() => undefined),
	sortBy: z
		.enum(['created_at', 'title'])
		.optional()
		.catch(() => undefined),
	sortDir: z
		.enum(['asc', 'desc'])
		.optional()
		.catch(() => undefined)
});

export const GET: RequestHandler = async (event) => {
	const user = event.locals.user;

	if (!user) {
		error(401, { message: 'Unauthorized' });
	}

	const sp = Object.fromEntries(event.url.searchParams);
	const query = getAllSchema.parse(sp);

	const result = await getTodos(user.id, {
		filter: {
			done: query.done,
			search: query.search
		},
		sort: {
			by: query.sortBy,
			dir: query.sortDir
		}
	});

	return toJson(result);
};

export const POST: RequestHandler = async (event) => {
	const user = event.locals.user;

	if (!user) {
		error(401, { message: 'Unauthorized' });
	}

	const contents = await event.request.text();

	try {
		const json = devalue.parse(contents);
		const result = createTodoSchema.safeParse(json);

		if (!result.success) {
			const message = result.error.issues
				.map((issue) => `${issue.path}: ${issue.message}`)
				.join('\n');

			error(400, { message });
		}

		const createdTodo = await createTodo(user.id, result.data);
		return toJson(createdTodo);
	} catch (err) {
		if (isHttpError(err)) {
			throw err;
		}

		console.error(err);
		error(500, { message: 'Internal Error' });
	}
};
