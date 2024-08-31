import { inject } from '$lib/client/di';
import { TodoService } from '$lib/services/todo.service';
import { error } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';

export const prerender = false;

export const load: LayoutLoad = async (event) => {
	const todoService = inject(TodoService);
	const todo = await todoService.getById(event.params.todo_id);

	if (!todo) {
		error(404, { message: 'Todo not found' });
	}

	return { todo };
};
