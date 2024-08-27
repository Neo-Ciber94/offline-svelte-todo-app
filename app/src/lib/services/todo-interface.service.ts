import type { CreateTodo, Todo, UpdateTodo } from '$lib/common/schema';

export type GetAllTodos = {
	filter?: {
		done?: boolean;
		search?: string;
	};
	sort?: {
		by?: 'created_at' | 'title';
		dir?: 'asc' | 'desc';
	};
};

export abstract class TodoServiceInterface {
	abstract getAll(query?: GetAllTodos): Promise<Todo[]>;
	abstract getById(todoId: string): Promise<Todo | null>;
	abstract insert(input: CreateTodo): Promise<Todo>;
	abstract update(input: UpdateTodo): Promise<Todo | null>;
	abstract delete(todoId: string): Promise<Todo | null>;
}
