import { browser } from '$app/environment';
import { pendingTodoSchema, todoSchema } from '$lib/common/schema';
import { BrowserDatabase } from 'browser-idb';

function createBrowserDb() {
	function create() {
		return new BrowserDatabase({
			version: 1,
			definition: {
				todos: {
					keys: ['id'],
					schema: todoSchema
				},
				pendingTodos: {
					keys: ['id'],
					schema: pendingTodoSchema
				}
			}
		});
	}

	type LocalDb = ReturnType<typeof create>;

	if (!browser) {
		return {} as LocalDb;
	}

	return create();
}

export const db = createBrowserDb();
