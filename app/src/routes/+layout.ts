import { inject } from '$lib/client/di';
import { getAllSchema } from '$lib/services/todo-interface.service';
import { TodoService } from '$lib/services/todo.service';
import type { LayoutLoad } from './$types';

export const prerender = true;
export const ssr = false;

export const load: LayoutLoad = async (event) => {
    const sp = Object.fromEntries(event.url.searchParams);
	const query = getAllSchema.parse(sp);
	const todoService = inject(TodoService);
	const todosPromise = todoService.getAll(query);
	
    return { todosPromise };
};
