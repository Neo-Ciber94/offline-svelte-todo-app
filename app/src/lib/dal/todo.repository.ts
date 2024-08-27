import type { CreateTodo, PendingTodo, Todo, UpdateTodo } from '$lib/common/schema';
import type { GetAllTodos } from '$lib/services/todo-interface.service';

export interface TodoRepository {
	getTodos(userId: string, query?: GetAllTodos): Promise<Todo[]>;
	getTodoById(userId: string, todoId: string): Promise<Todo | null>;
	createTodo(userId: string, input: CreateTodo, opts?: { onConflict?: 'update' }): Promise<Todo>;
	updateTodo(userId: string, input: UpdateTodo): Promise<Todo | null>;
	deleteTodo(userId: string, todoId: string): Promise<Todo | null>;
	synchronizeTodos(userId: string, pendingTodos: PendingTodo[]): Promise<number>;
}
