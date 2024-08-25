import { type Todo, type CreateTodo, type UpdateTodo, type PendingTodo } from '$lib/common/schema';
import type { GetAllTodos } from '$lib/services/todo-interface.service';
import { z } from 'zod';
import type { TodoRepository } from './todo.repository';
import PouchDB from 'pouchdb';
// import PouchDBAdapterNodeWebSql from 'pouchdb-adapter-node-websql';

// PouchDB.plugin(PouchDBAdapterNodeWebSql);

// const db = new PouchDB('data.db', { adapter: 'websql' });

const todoModelSchema = z.object({
	_id: z.string(),
	userId: z.string(),
	title: z.string(),
	description: z.string().optional(),
	emoji: z.string().emoji(),
	done: z.boolean(),
	createdAt: z.number()
});

const todoModelListSchema = z.array(todoModelSchema.optional().catch(() => undefined));

type TodoModel = z.infer<typeof todoModelSchema>;

export class PouchDbTodoRepository implements TodoRepository {
    constructor(private readonly db: PouchDB.Database){}

	async getTodos(userId: string, query?: GetAllTodos): Promise<Todo[]> {
		const { filter, sort } = query || {};
		const { by = 'createdAt', dir = 'asc' } = sort || {};

		const records = await this.db.find({
			selector: {
				userId,
				title: filter?.search,
				done: filter?.done
			},
			sort: [
				{
					[by]: dir
				}
			]
		});

		const result = todoModelListSchema.parse(records.docs);
		const models = result.filter((x): x is TodoModel => x != null);
		return models.map(mapToTodo);
	}

	async getTodoById(userId: string, todoId: string): Promise<Todo | null> {
		const records = await this.db.find({
			limit: 1,
			selector: {
				_id: todoId,
				userId
			}
		});

		const result = todoModelSchema.safeParse(records.docs[0]);

		if (result.error) {
			console.error(result.error);
		}

		return result.success ? mapToTodo(result.data) : null;
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
			description: input.description ?? null,
			emoji: input.emoji,
			createdAt: new Date(),
			done: false
		};

		await this.db.put(toTodoModel(newTodo), {
			force: onConflict === 'update'
		});

		return newTodo;
	}

	async updateTodo(userId: string, input: UpdateTodo): Promise<Todo | null> {
		const todoToUpdate = await this.getTodoById(userId, input.id);

		if (!todoToUpdate) {
			return null;
		}

		const updated: Todo = {
			...todoToUpdate,
			...input
		};

		await this.db.put(toTodoModel(updated));
		return updated;
	}

	async deleteTodo(userId: string, todoId: string): Promise<Todo | null> {
		const records = await this.db.find({
			limit: 1,
			selector: {
				_id: todoId,
				userId
			}
		});

		const toDelete = records.docs[0];

		if (!toDelete) {
			return null;
		}

		await this.db.remove(toDelete);
		const result = todoModelSchema.safeParse(toDelete);

		if (result.error) {
			console.error(result.error);
		}

		return result.success ? mapToTodo(result.data) : null;
	}

	synchronizeTodos(_userId: string, _pendingTodos: PendingTodo[]): Promise<number> {
		return Promise.resolve(0);
	}
}

function toTodoModel(todo: Todo): TodoModel {
	return {
		_id: todo.id,
		title: todo.title,
		description: todo.description ?? undefined,
		done: todo.done,
		emoji: todo.emoji,
		userId: todo.userId,
		createdAt: todo.createdAt.getTime()
	};
}

function mapToTodo(model: TodoModel): Todo {
	return {
		id: model._id,
		title: model.title,
		description: model.description ?? null,
		done: model.done,
		emoji: model.emoji,
		userId: model.userId,
		createdAt: new Date(model.createdAt)
	};
}
