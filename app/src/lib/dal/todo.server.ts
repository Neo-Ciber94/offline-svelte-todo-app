import type { CreateTodo, PendingTodo, Todo, UpdateTodo } from '$lib/common/schema';
import { DEFAULT_EMOJI } from '$lib/common/emojis';
import { applyTodosQuery } from '$lib/common/todo.utils';
import type { GetAllTodos } from '$lib/services/todo-interface.service';
import { db } from '$lib/server/db';
import type { TodoRepository } from './todo.repository';

type TodoModel = {
	id: string;
	user_id: string;
	title: string;
	description: string | null;
	emoji: string;
	done: boolean;
	created_at: number;
};

class ServerTodoRepository implements TodoRepository {
	async getTodos(userId: string, query?: GetAllTodos): Promise<Todo[]> {
		const todos = await db
			.all<TodoModel[]>('SELECT * FROM todo WHERE user_id = ?', [userId])
			.then((result) => result.map(this.mapToTodo));
		return applyTodosQuery(todos, userId, query);
	}

	async getTodoById(userId: string, todoId: string): Promise<Todo | null> {
		const todo = await db.get<TodoModel>(
			'SELECT * FROM todo WHERE id = :todo_id AND user_id = :user_id',
			{
				':todo_id': todoId,
				':user_id': userId
			}
		);

		return todo ? this.mapToTodo(todo) : null;
	}

	async createTodo(
		userId: string,
		input: CreateTodo,
		opts?: { onConflict?: 'update' }
	): Promise<Todo> {
		const { onConflict } = opts || {};
		const newTodo: Todo = {
			userId,
			id: input.id ?? crypto.randomUUID(),
			title: input.title,
			description: input.description ?? undefined,
			emoji: input.emoji,
			createdAt: new Date(),
			done: false
		};

		let query = `
			INSERT INTO todo(id, user_id, title, description, emoji, done, created_at) 
			VALUES(:id, :user_id, :title, :description, :emoji, :done, :created_at)
		`;

		if (onConflict === 'update') {
			query += `
				ON CONFLICT(id) DO UPDATE SET 
					user_id = excluded.user_id,
					title = excluded.title,
					description = excluded.description,
					emoji = excluded.emoji,
					done = excluded.done,
					created_at = excluded.created_at
			`;
		}

		await db.run(query, {
			':id': newTodo.id,
			':user_id': newTodo.userId,
			':title': newTodo.title,
			':description': newTodo.description,
			':emoji': newTodo.emoji,
			':done': Number(newTodo.done),
			':created_at': newTodo.createdAt.getTime()
		});

		return newTodo;
	}

	async updateTodo(userId: string, input: UpdateTodo): Promise<Todo | null> {
		const todoToUpdate = await db.get<TodoModel>(
			'SELECT * FROM todo WHERE id = ? AND user_id = ?',
			[input.id, userId]
		);

		if (!todoToUpdate) {
			return null;
		}

		await db.run(
			`UPDATE todo 
				SET 
					title = :title,
					description = :description,
					emoji = :emoji,
					done = :done
				WHERE id = :id AND user_id = :user_id
			`,
			{
				':id': input.id,
				':user_id': userId,
				':title': input.title == null ? todoToUpdate.title : input.title,
				':description': input.description == null ? todoToUpdate.description : input.description,
				':done': input.done == null ? Number(todoToUpdate.done) : Number(input.done),
				':emoji': input.emoji == null ? todoToUpdate.emoji : input.emoji
			}
		);

		return this.mapToTodo(todoToUpdate);
	}

	async deleteTodo(userId: string, todoId: string): Promise<Todo | null> {
		const deleted = await db.get<TodoModel>(
			'DELETE FROM todo WHERE id = ? AND user_id = ? RETURNING *',
			[todoId, userId]
		);

		return deleted ? this.mapToTodo(deleted) : null;
	}

	async synchronizeTodos(userId: string, pendingTodos: PendingTodo[]): Promise<number> {
		const operations: Promise<void>[] = [];

		async function run(f: () => Promise<unknown>) {
			await f();
		}

		try {
			await db.run('BEGIN TRANSACTION');

			for (const pending of pendingTodos) {
				switch (pending.action.type) {
					case 'create': {
						const input = pending.action.input;
						operations.push(run(() => this.createTodo(userId, input)));
						break;
					}
					case 'update': {
						const input: CreateTodo = {
							...pending.action.input,
							title: pending.action.input.title ?? '<empty>',
							emoji: pending.action.input.emoji ?? DEFAULT_EMOJI
						};

						operations.push(run(() => this.createTodo(userId, input, { onConflict: 'update' })));
						break;
					}
					case 'delete': {
						const todoId = pending.action.input.id;
						operations.push(run(() => this.deleteTodo(userId, todoId)));
						break;
					}
				}
			}

			await Promise.all(operations);
			await db.run('COMMIT TRANSACTION');
		} catch (err) {
			console.error(err);
			await db.run('ROLLBACK');
		}

		return pendingTodos.length;
	}

	private mapToTodo(model: TodoModel): Todo {
		return {
			id: model.id,
			userId: model.user_id,
			description: model.description ?? undefined,
			emoji: model.emoji,
			done: Boolean(model.done),
			title: model.title,
			createdAt: new Date(model.created_at)
		};
	}
}

export const todosRepository = new ServerTodoRepository();
