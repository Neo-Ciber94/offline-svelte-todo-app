import type { Todo, User } from '$lib/data';

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

export type CreateTodo = {
	title: string;
	description: string | null;
};

export type UpdateTodo = {
	id: string;
	title?: string;
	description?: string;
	done?: boolean;
};

export abstract class TodoRepositoryInterface {
	abstract getAll(query?: GetAllTodos): Promise<Todo[]>;
	abstract getById(todoId: string): Promise<Todo | null>;
	abstract insert(input: CreateTodo): Promise<Todo>;
	abstract update(input: UpdateTodo): Promise<Todo | null>;
	abstract delete(todoId: string): Promise<Todo | null>;
}

export abstract class UserRepositoryInterface {
	abstract getCurrentUser(): Promise<User | null>;
	abstract logout(): Promise<void>;
}

export abstract class NetworkProvider {
	abstract isOnline(): boolean;
}
