import type { PendingTodo, Todo } from '$lib/common/schema';
import { db } from '$lib/server/db';
import { TodoRepository } from '$lib/data/todo.repository';

class ServerTodoRepository extends TodoRepository {
	private async setTodo(newTodo: Todo, opts?: { onConflict?: 'update' }): Promise<Todo> {
		const { onConflict } = opts || {};

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
						const newTodo: Todo = {
							userId,
							id: input.id ?? crypto.randomUUID(),
							title: input.title,
							description: input.description ?? undefined,
							emoji: input.emoji,
							createdAt: input.createdAt ?? new Date(),
							done: input.done == null ? false : input.done
						};

						operations.push(run(() => this.setTodo(newTodo)));
						break;
					}
					case 'update': {
						const input = pending.action.input;
						operations.push(run(() => this.update(userId, input)));
						break;
					}
					case 'delete': {
						const todoId = pending.action.input.id;
						operations.push(run(() => this.delete(userId, todoId)));
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
}

export const todosRepository = new ServerTodoRepository(db);
