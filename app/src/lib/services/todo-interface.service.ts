import type { CreateTodo, Todo, UpdateTodo } from '$lib/common/schema';
import { z } from 'zod';

export const getAllSchema = z.object({
	state: z
		.enum(['completed', 'pending'])
		.optional()
		.catch(() => undefined),
	search: z
		.string()
		.optional()
		.catch(() => undefined),
	sortBy: z
		.enum(['created_at', 'title'])
		.optional()
		.catch(() => undefined),
	sortDir: z
		.enum(['asc', 'desc'])
		.optional()
		.catch(() => undefined)
});

export type GetAllTodos = z.infer<typeof getAllSchema>;

export abstract class TodoServiceInterface {
	abstract getAll(query?: GetAllTodos): Promise<Todo[]>;
	abstract getById(todoId: string): Promise<Todo | null>;
	abstract insert(input: CreateTodo): Promise<Todo>;
	abstract update(input: UpdateTodo): Promise<Todo | null>;
	abstract delete(todoId: string): Promise<Todo | null>;
}
