import type { CreateTodo, Todo, UpdateTodo } from '$lib/common/schema';
import { TodoServiceInterface, type GetAllTodos } from './todo-interface.service';
import * as devalue from 'devalue';

export class NetworkTodoService extends TodoServiceInterface {
	async getAll(query?: GetAllTodos): Promise<Todo[]> {
		const { search, sortBy, sortDir, state } = query || {};
		const searchParams = new URLSearchParams();

		if (state != null) {
			searchParams.set('state', state.toString());
		}

		if (search) {
			searchParams.set('search', search);
		}

		if (sortBy) {
			searchParams.set('sortBy', sortBy);
		}

		if (sortDir) {
			searchParams.set('sortDir', sortDir);
		}

		const res = await fetch(`/api/todos?${searchParams.toString()}`);
		const contents = await res.text();

		if (!res.ok) {
			const json = JSON.parse(contents);
			const error = typeof json?.message === 'string' ? json.message : 'Something went wrong';
			throw new Error(error);
		}

		const json = devalue.parse(contents);
		return json as Todo[];
	}

	async getById(todoId: string): Promise<Todo | null> {
		const res = await fetch(`/api/todos/${todoId}`);
		const contents = await res.text();

		if (res.status === 404) {
			return null;
		}

		if (!res.ok) {
			const json = JSON.parse(contents);
			const error = typeof json?.message === 'string' ? json.message : 'Something went wrong';
			throw new Error(error);
		}

		const json = devalue.parse(contents);
		return json as Todo;
	}

	async insert(input: CreateTodo): Promise<Todo> {
		const res = await fetch(`/api/todos`, {
			method: 'POST',
			body: devalue.stringify(input),
			headers: {
				'content-type': 'application/json+devalue'
			}
		});

		const contents = await res.text();

		if (!res.ok) {
			const json = JSON.parse(contents);
			const error = typeof json?.message === 'string' ? json.message : 'Something went wrong';
			throw new Error(error);
		}

		const json = devalue.parse(contents);
		return json as Todo;
	}

	async update(input: UpdateTodo): Promise<Todo | null> {
		const res = await fetch(`/api/todos/${input.id}`, {
			method: 'PUT',
			body: devalue.stringify(input),
			headers: {
				'content-type': 'application/json+devalue'
			}
		});

		const contents = await res.text();

		if (!res.ok) {
			const json = JSON.parse(contents);
			const error = typeof json?.message === 'string' ? json.message : 'Something went wrong';
			throw new Error(error);
		}

		const json = devalue.parse(contents);
		return json as Todo;
	}

	async delete(todoId: string): Promise<Todo | null> {
		const res = await fetch(`/api/todos/${todoId}`, {
			method: 'DELETE'
		});

		const contents = await res.text();

		if (!res.ok) {
			const json = JSON.parse(contents);
			const error = typeof json?.message === 'string' ? json.message : 'Something went wrong';
			throw new Error(error);
		}

		const json = devalue.parse(contents);
		return json as Todo;
	}
}
