import { z } from 'zod';

export const todoSchema = z.object({
	id: z.string(),
	userId: z.string(),
	title: z.string(),
	description: z.string().nullable(),
	emoji: z.string().emoji(),
	done: z.boolean().default(false),
	createdAt: z.date().default(() => new Date())
});

export type User = z.infer<typeof userSchema>;

export const userSchema = z.object({
	id: z.string(),
	username: z.string(),
	createdAt: z.date().default(() => new Date())
});

export type Todo = z.infer<typeof todoSchema>;

export const createTodoSchema = z.object({
	id: z
		.string()
		.uuid()
		.default(() => crypto.randomUUID())
		.optional()
		.catch(() => crypto.randomUUID()),
	title: z.string(),
	description: z.string().nullable(),
	emoji: z.string().emoji().default('✅')
});

export type CreateTodo = z.infer<typeof createTodoSchema>;

export const updateTodoSchema = z.object({
	id: z.string(),
	title: z.string().optional(),
	description: z.string().optional(),
	emoji: z.string().emoji().optional(),
	done: z.boolean().optional()
});

export type UpdateTodo = z.infer<typeof updateTodoSchema>;

export const deleteTodoSchema = z.object({
	id: z.string()
});

export const pendingTodoSchema = z.object({
	id: z.string(),
	action: z.discriminatedUnion('type', [
		z.object({
			type: z.literal('create'),
			input: createTodoSchema
		}),
		z.object({
			type: z.literal('update'),
			input: updateTodoSchema
		}),
		z.object({
			type: z.literal('delete'),
			input: deleteTodoSchema
		})
	])
});

export type PendingTodo = z.infer<typeof pendingTodoSchema>;
