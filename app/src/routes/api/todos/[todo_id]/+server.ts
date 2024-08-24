import { error, isHttpError } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { customJson } from '$lib/server/helpers';
import * as devalue from 'devalue';
import { updateTodoSchema } from '$lib/common/schema';
import { getTodoById, updateTodo, deleteTodo } from '$lib/server/data/todo';

export const GET: RequestHandler = async (event) => {
	const user = event.locals.user;

	if (!user) {
		error(401, { message: 'Unauthorized' });
	}

	const result = await getTodoById(user.id, event.params.todo_id);

	if (!result) {
		error(404, { message: 'Todo not found' });
	}

	return customJson(result);
};

export const PUT: RequestHandler = async (event) => {
	const user = event.locals.user;

	if (!user) {
		error(401, { message: 'Unauthorized' });
	}

	const contents = await event.request.text();

	try {
		const json = devalue.parse(contents);
		const result = updateTodoSchema.safeParse(json);

		if (!result.success) {
			const message = result.error.issues
				.map((issue) => `${issue.path}: ${issue.message}`)
				.join('\n');

			error(400, { message });
		}

		if (result.data.id !== event.params.todo_id) {
			error(407, { message: 'Forbidden' });
		}

		const createdTodo = await updateTodo(user.id, result.data);
		return customJson(createdTodo);
	} catch (err) {
		if (isHttpError(err)) {
			throw err;
		}

		console.error(err);
		error(500, { message: 'Internal Error' });
	}
};

export const DELETE: RequestHandler = async (event) => {
	const user = event.locals.user;

	if (!user) {
		error(401, { message: 'Unauthorized' });
	}

	try {
		const deleted = await deleteTodo(user.id, event.params.todo_id);

		if (!deleted) {
			error(404, { message: 'Todo not found' });
		}

		return customJson(deleted);
	} catch (err) {
		if (isHttpError(err)) {
			throw err;
		}

		console.error(err);
		error(500, { message: 'Internal Error' });
	}
};
