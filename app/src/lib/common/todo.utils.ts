import type { GetAllTodos } from '$lib/services/todo-interface.service';
import type { Todo } from './schema';

export function applyTodosQuery(todos: Todo[], userId: string, query?: GetAllTodos) {
	const { filter, sort } = query || {};
	const search = filter?.search?.toLowerCase();
	const orderBy = sort?.by || 'created_at';
	const orderDir = sort?.dir || 'desc';

	return todos
		.map((todo) => ({ ...todo }))
		.filter((todo) => todo.userId === userId)
		.filter((todo) => {
			return typeof filter?.done === 'boolean' ? todo.done === filter.done : true;
		})
		.filter((todo) => {
			if (search == null) {
				return true;
			}

			return (
				todo.title.toLowerCase().includes(search) ||
				todo.description?.toLowerCase().includes(search)
			);
		})
		.sort((a, b) => {
			switch (true) {
				case orderBy === 'title' && orderDir === 'desc': {
					return a.title.localeCompare(b.title);
				}
				case orderBy === 'title' && orderDir === 'asc': {
					return b.title.localeCompare(b.title);
				}
				case orderBy === 'created_at' && orderDir === 'desc': {
					return a.createdAt.getTime() - b.createdAt.getTime();
				}
				case orderBy === 'created_at' && orderDir === 'asc': {
					return b.createdAt.getTime() - a.createdAt.getTime();
				}
				default: {
					return 0;
				}
			}
		});
}
