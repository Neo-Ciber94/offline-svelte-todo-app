import type { CreateTodo, PendingTodo, Todo, UpdateTodo } from '$lib/common/schema';
import type { GetAllTodos } from '$lib/services/todo-interface.service';
import type { TodoRepository } from './todo.repository';

export class ClientTodoRepository implements TodoRepository {
	async getTodos(_userId: string, _query?: GetAllTodos): Promise<Todo[]> {
		return [];
	}

	async getTodoById(_todoId: string): Promise<Todo | null> {
		return null;
	}

	async createTodo(
		_userId: string,
		_input: CreateTodo,
		_opts?: { onConflict?: 'update' }
	): Promise<Todo> {
		return {
			id: '',
			userId: '',
			title: '',
			description: null,
			emoji: '',
			done: false,
			createdAt: new Date()
		};
	}

	async updateTodo(_userId: string, _input: UpdateTodo): Promise<Todo | null> {
		return null;
	}

	async deleteTodo(_userId: string, _todoId: string): Promise<Todo | null> {
		return null;
	}

	async synchronizeTodos(_userId: string, _pendingTodos: PendingTodo[]): Promise<number> {
		return 0;
	}
}
