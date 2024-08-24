import { type CreateTodo, type Todo, type UpdateTodo } from '$lib/common/schema';
import type { SqliteDatabaseAdapter } from '$lib/server/db/adapters';
import type { GetAllTodos } from '$lib/services/todo-interface.service';

type TodoModel = {
	id: string;
	user_id: string;
	title: string;
	description: string | null;
	emoji: string;
	done: boolean;
	created_at: number;
};

export class TodoRepository {
	constructor(private readonly db: SqliteDatabaseAdapter) {}

	async getTodos(userId: string, query?: GetAllTodos) {
		const builder: QueryBuilder = {
			select: 'SELECT * FROM todo',
			where: [
				{
					sql: 'user_id = :user_id',
					params: { ':user_id': userId }
				}
			]
		};

		// Filter
		if (query) {
			if (query.filter?.done != null) {
				builder.where.push({
					sql: 'todo.done = :done',
					params: {
						':done': Number(query.filter.done)
					}
				});
			}

			if (query.filter?.search) {
				builder.where.push({
					sql: 'LOWER(todo.title) LIKE %:search%',
					params: {
						':search': query.filter.search.toLowerCase()
					}
				});
			}
		}

		// Ordering
		const { by = 'created_at', dir = 'asc' } = query?.sort || {};
		builder.sort = {
			sql: `:sort_by :sort_dir`,
			params: {
				':sort_by': by,
				':sort_dir': dir
			}
		};

		const { sql, params } = queryBuilderToSql(builder);
		const result = await this.db.all<TodoModel>(sql, params);

		const values = result.map(mapToTodo);
		return values;
	}

	async insert(userId: string, input: CreateTodo, opts?: { onConflict?: 'update' }) {
		const onConflict = opts?.onConflict;
		const newTodo: Todo = {
			userId,
			id: input.id ?? crypto.randomUUID(),
			title: input.title,
			description: input.description ?? null,
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

		await this.db.run(query, {
			':id': newTodo.id,
			':user_id': newTodo.userId,
			':title': newTodo.title,
			':description': newTodo.description,
			':emoji': newTodo.emoji,
			':done': Number(newTodo.done),
			':created_at': newTodo.createdAt.getTime()
		});
	}

	async update(userId: string, input: UpdateTodo) {
		const todoToUpdate = await this.db.first<TodoModel>(
			'SELECT * FROM todo WHERE id = :todo_id AND user_id = :user_id',
			{
				':todo_id': input.id,
				':user_id': userId
			}
		);

		if (!todoToUpdate || todoToUpdate.user_id !== userId) {
			return null;
		}

		await this.db.run(
			`UPDATE todo 
                SET 
                    title = :title,
                    description = :description,
                    emoji = :emoji,
                    done = :done
                WHERE id = :id AND :user_id = :user_id
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

		return mapToTodo(todoToUpdate);
	}

	async delete(userId: string, todoId: string) {
		const deleted = await this.db.first<TodoModel>(
			'DELETE FROM todo WHERE id = :todo_id AND user_id = :user_id RETURNING *',
			{
				':todo_id': todoId,
				':user_id': userId
			}
		);

		if (!deleted) {
			return null;
		}

		return mapToTodo(deleted);
	}
}

type QueryBuilder = {
	select: string;
	where: {
		sql: string;
		params?: Record<string, unknown>;
	}[];
	sort?: {
		sql: string;
		params?: Record<string, unknown>;
	};
};

function queryBuilderToSql(builder: QueryBuilder) {
	let params: Record<string, unknown> = {};
	let sql = builder.select;

	if (builder.where.length > 0) {
		const expr = builder.where.map((x) => `(${x})`).join(' AND ');
		sql += `WHERE ${expr}`;

		builder.where.forEach((expr) => {
			params = {
				...params,
				...expr.params
			};
		});
	}

	if (builder.sort) {
		sql += `ORDER BY ${builder.sort.sql}`;
		params = {
			...params,
			...builder.sort.params
		};
	}

	return { sql, params };
}

function mapToTodo(model: TodoModel): Todo {
	return {
		id: model.id,
		title: model.title,
		description: model.description,
		emoji: model.emoji,
		done: Boolean(model.done),
		userId: model.user_id,
		createdAt: new Date(model.created_at)
	};
}
