import { type CreateTodo, type Todo, type UpdateTodo } from '$lib/common/schema';
import type { SqliteDatabaseAdapter } from '$lib/db/adapters';
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
			column: by,
			dir
		};

		const { sql, params } = queryBuilderToSql(builder);
		const result = await this.db.all<TodoModel>(sql, params);

		const values = result.map(x => mapToTodo(x));
		return values;
	}

	async getTodoById(userId: string, todoId: string) {
		const todo = await this.db.first<TodoModel>(
			'SELECT * FROM todo WHERE id = :todo_id AND user_id = :user_id',
			{
				':todo_id': todoId,
				':user_id': userId
			}
		);

		if (!todo) {
			return null;
		}

		return mapToTodo(todo);
	}

	async insert(userId: string, input: CreateTodo, opts?: { onConflict?: 'update' }) {
		const onConflict = opts?.onConflict;
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

		await this.db.run(query, {
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

	async insertMany(userId: string, inputs: CreateTodo[]) {
		const newTodos: Todo[] = inputs.map((input) => ({
			userId,
			id: input.id ?? crypto.randomUUID(),
			title: input.title,
			description: input.description,
			emoji: input.emoji,
			createdAt: new Date(),
			done: false
		}));

		const placeholders = newTodos
			.map((_, index) => {
				return `(:id_${index}, :user_id_${index}, :title_${index}, :description_${index}, :emoji_${index}, :done_${index}, :created_at_${index})`;
			})
			.join(', ');

		const query = `
			INSERT INTO todo(id, user_id, title, description, emoji, done, created_at) 
			VALUES ${placeholders}
		`;

		const params = newTodos.reduce(
			(acc, todo, index) => {
				acc[`:id_${index}`] = todo.id;
				acc[`:user_id_${index}`] = todo.userId;
				acc[`:title_${index}`] = todo.title;
				acc[`:description_${index}`] = todo.description;
				acc[`:emoji_${index}`] = todo.emoji;
				acc[`:done_${index}`] = Number(todo.done);
				acc[`:created_at_${index}`] = todo.createdAt.getTime();
				return acc;
			},
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			{} as Record<string, any>
		);

		await this.db.run(query, params);

		return newTodos;
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
		column: string;
		dir: 'asc' | 'desc';
	};
};

function queryBuilderToSql(builder: QueryBuilder) {
	let params: Record<string, unknown> = {};
	let sql = builder.select;

	if (builder.where.length > 0) {
		const expr = builder.where.map((expr) => `(${expr.sql})`).join(' AND ');
		sql += ` WHERE ${expr}`;

		builder.where.forEach((expr) => {
			params = {
				...params,
				...expr.params
			};
		});
	}

	if (builder.sort) {
		const dir = builder.sort.dir === 'asc' ? 'ASC' : 'DESC';
		sql += ` ORDER BY ${escapeIdentifier(builder.sort.column)} ${dir}`;
	}

	return { sql, params };
}

function escapeIdentifier(str: string) {
	return '`' + str.replace(/`/g, '``') + '`';
}

function mapToTodo(model: TodoModel): Todo {
	return {
		id: model.id,
		title: model.title,
		description: model.description ?? undefined,
		emoji: model.emoji,
		done: Boolean(model.done),
		userId: model.user_id,
		createdAt: new Date(model.created_at)
	};
}
