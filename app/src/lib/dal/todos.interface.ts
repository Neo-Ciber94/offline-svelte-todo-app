import type { CreateTodo, Todo, UpdateTodo } from '$lib/data';

export type GetAllTodos = {
	filter?: {
		done?: boolean;
		search?: string;
	};
	sort?: {
		by?: 'createdAt' | 'title';
		dir?: 'asc' | 'desc';
	};
};

export abstract class TodoRepositoryInterface {
	abstract synchronize(): Promise<void>;
	abstract getAll(query?: GetAllTodos): Promise<Todo[]>;
	abstract getById(todoId: string): Promise<Todo | null>;
	abstract insert(input: CreateTodo): Promise<Todo>;
	abstract update(input: UpdateTodo): Promise<Todo | null>;
	abstract delete(todoId: string): Promise<Todo | null>;
}
