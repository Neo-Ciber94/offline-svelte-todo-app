import type { CreateTodo, PendingTodo, UpdateTodo } from '$lib/common/schema';
import { todosRepository } from '$lib/dal/todo.server';
import type { GetAllTodos } from '$lib/services/todo-interface.service';

export async function getTodos(userId: string, query?: GetAllTodos) {
	return todosRepository.getTodos(userId, query);
}

export async function getTodoById(userId: string, todoId: string) {
	return todosRepository.getTodoById(userId, todoId);
}

export async function createTodo(
	userId: string,
	input: CreateTodo,
	opts?: {
		onConflict?: 'update';
	}
) {
	return todosRepository.insert(userId, input, opts);
}

export async function updateTodo(userId: string, input: UpdateTodo) {
	return todosRepository.update(userId, input);
}

export async function deleteTodo(userId: string, todoId: string) {
	return todosRepository.delete(userId, todoId);
}

export async function synchronizeTodos(userId: string, pendingTodos: PendingTodo[]) {
	return todosRepository.synchronizeTodos(userId, pendingTodos);
}
