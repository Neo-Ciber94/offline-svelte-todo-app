import {
	createTodoSchema,
	updateTodoSchema,
	type CreateTodo,
	type PendingTodo,
	type Todo,
	type UpdateTodo
} from '$lib/common/schema';
import { applyTodosQuery } from '$lib/common/todo.utils';
import { db } from '$lib/services/local-db';
import type { GetAllTodos } from '$lib/services/todo-interface.service';
import type { TodoRepository } from './todo.repository';

export class ClientTodoRepository implements TodoRepository {
	async getTodos(userId: string, query?: GetAllTodos): Promise<Todo[]> {
		const todos = await db.stores.todos.getAll();
		return applyTodosQuery(todos, userId, query);
	}

	async getTodoById(_userId: string, todoId: string): Promise<Todo | null> {
		const todo = await db.stores.todos.getByKey(todoId);
		return todo ?? null;
	}

	async createTodo(
		userId: string,
		input: CreateTodo,
		opts?: { onConflict?: 'update' }
	): Promise<Todo> {
		const result = createTodoSchema.parse(input);

		const newTodo: Todo = {
			userId,
			id: input.id ?? crypto.randomUUID(),
			title: result.title,
			description: result.description ?? null,
			emoji: result.emoji,
			done: false,
			createdAt: new Date()
		};

		// Add the new todo
		await db.stores.todos.set(newTodo);

		return Object.assign({}, newTodo);
	}

	async updateTodo(userId: string, input: UpdateTodo): Promise<Todo | null> {
		const todoToUpdate = await db.stores.todos.getByKey(input.id);

		if (!todoToUpdate || todoToUpdate.userId !== userId) {
			return null;
		}

		const result = updateTodoSchema.parse(input);

		todoToUpdate.title = result.title == null ? todoToUpdate.title : result.title;
		todoToUpdate.description =
			result.description == null ? todoToUpdate.description : result.description;
		todoToUpdate.done = result.done == null ? todoToUpdate.done : result.done;
		todoToUpdate.emoji = result.emoji == null ? todoToUpdate.emoji : result.emoji;

		await db.stores.todos.set(todoToUpdate);

		return todoToUpdate;
	}

	async deleteTodo(userId: string, todoId: string): Promise<Todo | null> {
		const todoToDelete = await db.stores.todos.getByKey(todoId);

		if (todoToDelete == null || todoToDelete.userId !== userId) {
			return null;
		}

		await db.stores.todos.delete(todoId);
		return todoToDelete;
	}

	async synchronizeTodos(_userId: string, _pendingTodos: PendingTodo[]): Promise<number> {
		return 0;
	}
}
