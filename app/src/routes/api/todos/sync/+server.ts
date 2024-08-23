import { z } from 'zod';
import type { RequestHandler } from './$types';
import { pendingTodoSchema } from '$lib/common/schema';
import { error } from '@sveltejs/kit';
import { synchronizeTodos } from '$lib/server';
import * as devalue from 'devalue';
import { customJson } from '$lib/server/helpers';

const pendingTodoArray = z.array(pendingTodoSchema);

export type PendingTodosOutput = {
	processed: number;
};

export const POST: RequestHandler = async (event) => {
	const user = event.locals.user;

	if (!user) {
		error(401, { message: 'Unauthorized' });
	}

	const contents = await event.request.text();
	const json = devalue.parse(contents);
	const result = pendingTodoArray.safeParse(json);

	if (!result.success) {
		const message = result.error.issues
			.map((issue) => `${issue.path}: ${issue.message}`)
			.join('\n');

		error(400, { message });
	}

	const processed = await synchronizeTodos(user.id, result.data);

	return customJson<PendingTodosOutput>({ processed });
};
