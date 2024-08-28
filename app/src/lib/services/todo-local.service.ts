import { getDb } from '$lib/client/db';
import { ApplicationError } from '$lib/common/error';
import {
	createTodoSchema,
	updateTodoSchema,
	type CreateTodo,
	type Todo,
	type UpdateTodo
} from '$lib/common/schema';
import { TodoRepository } from '$lib/data/todo.repository';
import { inject } from '$lib/client/di';
import { TodoServiceInterface, type GetAllTodos } from './todo-interface.service';
import { UserService } from './user.service';

export class LocalTodoService extends TodoServiceInterface {
	private userService = inject(UserService);
	private todoRepository = getDb().then((db) => new TodoRepository(db));

	async getAll(query?: GetAllTodos): Promise<Todo[]> {
		const user = await this.userService.getCurrentUser();

		if (!user) {
			return [];
		}

		const repo = await this.todoRepository;
		return repo.getTodos(user.id, query);
	}

	async getById(todoId: string): Promise<Todo | null> {
		const user = await this.userService.getCurrentUser();

		if (!user) {
			throw new ApplicationError(400, 'Failed to get current user');
		}

		const repo = await this.todoRepository;
		const result = await repo.getTodoById(user.id, todoId);
		return result;
	}

	async insert(input: CreateTodo): Promise<Todo> {
		const user = await this.userService.getCurrentUser();

		if (!user) {
			throw new ApplicationError(400, 'Failed to get current user');
		}

		const result = createTodoSchema.parse(input);
		const repo = await this.todoRepository;
		return await repo.insert(user.id, result);
	}

	async update(input: UpdateTodo): Promise<Todo | null> {
		const user = await this.userService.getCurrentUser();

		if (!user) {
			throw new Error('Failed to get current user');
		}

		const result = updateTodoSchema.parse(input);
		const repo = await this.todoRepository;
		return repo.update(user.id, result);
	}

	async delete(todoId: string): Promise<Todo | null> {
		const user = await this.userService.getCurrentUser();

		if (!user) {
			throw new Error('Failed to get current user');
		}

		const repo = await this.todoRepository;
		return repo.delete(user.id, todoId);
	}
}
