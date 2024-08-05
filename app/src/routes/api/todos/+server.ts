import { createTodo, getTodos } from '$lib/server';
import { customJson } from '$lib/server/helpers';
import { error, type RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';
import * as devalue from 'devalue';

const getAllSchema = z.object({
	done: z.coerce
		.boolean()
		.optional()
		.catch(() => undefined),
	search: z
		.string()
		.optional()
		.catch(() => undefined),
	sortBy: z
		.enum(['createdAt', 'title'])
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

	return customJson(result);
};

const todoSchema = z.object({
	title: z.string(),
	description: z.string().nullable()
});

export const POST: RequestHandler = async (event) => {
	const user = event.locals.user;

	if (!user) {
		error(401, { message: 'Unauthorized' });
	}

	const contents = await event.request.text();

	try {
		const json = devalue.parse(contents);
		const result = todoSchema.safeParse(json);

		if (!result.success) {
			const message = result.error.issues
				.map((issue) => `${issue.path}: ${issue.message}`)
				.join('\n');

			error(400, { message });
		}

		const createdTodo = await createTodo(user.id, result.data);
		return customJson(createdTodo);
	} catch (err) {
		console.error(err);
		error(500, { message: 'Internal Error' });
	}
};
