import { ApplicationError } from '$lib/common/error';
import type { CreateTodo, Todo, UpdateTodo, User } from '$lib/common/schema';
import type { GetAllTodos } from '$lib/services/todo-interface.service';

const TODOS = new Map<string, Todo>();
const USERS = new Map<string, User>();

export async function getTodos(userId: string, query?: GetAllTodos) {
	const { filter, sort } = query || {};
	const search = filter?.search?.toLowerCase();
	const orderBy = sort?.by || 'createdAt';
	const orderDir = sort?.dir || 'desc';

	return Array.from(TODOS.values())
		.map((todo) => ({ ...todo }))
		.filter((todo) => todo.userId === userId)
		.filter((todo) => {
			return typeof filter?.done === 'boolean' ? todo.done === filter.done : true;
		})
		.filter((todo) => {
			if (search == null) {
				return true;
			}

			return (
				todo.title.toLowerCase().includes(search) ||
				todo.description?.toLowerCase().includes(search)
			);
		})
		.sort((a, b) => {
			switch (true) {
				case orderBy === 'title' && orderDir === 'desc': {
					return a.title.localeCompare(b.title);
				}
				case orderBy === 'title' && orderDir === 'asc': {
					return b.title.localeCompare(b.title);
				}
				case orderBy === 'createdAt' && orderDir === 'desc': {
					return a.createdAt.getTime() - b.createdAt.getTime();
				}
				case orderBy === 'createdAt' && orderDir === 'asc': {
					return b.createdAt.getTime() - a.createdAt.getTime();
				}
				default: {
					return 0;
				}
			}
		});
}

export async function getTodoById(todoId: string) {
	const todo = TODOS.get(todoId);

	if (!todo) {
		return null;
	}

	return Object.assign({}, todo);
}

export async function createTodo(userId: string, input: CreateTodo) {
	const newTodo: Todo = {
		userId,
		title: input.title,
		description: input.description,
		id: crypto.randomUUID(),
		createdAt: new Date(),
		done: false
	};

	TODOS.set(newTodo.id, newTodo);
	return newTodo;
}

export async function updateTodo(userId: string, input: UpdateTodo) {
	const todoToUpdate = TODOS.get(input.id);

	if (!todoToUpdate) {
		return null;
	}

	if (todoToUpdate.userId !== userId) {
		return null;
	}

	todoToUpdate.title = input.title == null ? todoToUpdate.title : input.title;
	todoToUpdate.description =
		input.description == null ? todoToUpdate.description : input.description;
	todoToUpdate.done = input.done == null ? todoToUpdate.done : input.done;

	return Object.assign({}, todoToUpdate);
}

export async function deleteTodo(userId: string, todoId: string) {
	const todoToDelete = TODOS.get(todoId);

	if (!todoToDelete) {
		return null;
	}

	if (todoToDelete.userId !== userId) {
		return null;
	}

	TODOS.delete(todoId);
	return todoToDelete;
}

export async function registerUser(username: string) {
	const alreadyExists = Array.from(USERS.values()).some((user) => user.username === username);

	if (alreadyExists) {
		throw new ApplicationError(400, 'User already exists');
	}

	const user: User = {
		id: crypto.randomUUID(),
		createdAt: new Date(),
		username
	};

	USERS.set(user.id, user);
	return Object.assign({}, user);
}

export async function getUser(userId: string) {
	const user = USERS.get(userId);

	if (!user) {
		return null;
	}

	return Object.assign({}, user);
}

export async function getUserByUsername(username: string) {
	const user = Array.from(USERS.values()).find((user) => user.username === username);

	if (!user) {
		return null;
	}

	return Object.assign({}, user);
}

export async function generateUserToken(user: User) {
	const authToken = btoa(user.id);
	return authToken;
}

export async function getUserByToken(authToken: string) {
	const userId = atob(authToken);
	const user = await getUser(userId);
	return user;
}
