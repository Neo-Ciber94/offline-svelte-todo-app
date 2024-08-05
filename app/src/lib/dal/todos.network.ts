import type { Todo } from '$lib/data';
import {
	TodoRepositoryInterface,
	type CreateTodo,
	type GetAllTodos,
	type UpdateTodo
} from './todos.interface';
import * as devalue from 'devalue';

export class NetworkTodosRepository extends TodoRepositoryInterface {
	async getAll(query?: GetAllTodos): Promise<Todo[]> {
		const { filter, sort } = query || {};
		const searchParams = new URLSearchParams();

		if (filter?.done) {
			searchParams.set('done', filter.done.toString());
		}

		if (filter?.search) {
			searchParams.set('search', filter.search);
		}

		if (sort?.by) {
			searchParams.set('sortBy', sort.by);
		}

		if (sort?.dir) {
			searchParams.set('sortDir', sort.dir);
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
