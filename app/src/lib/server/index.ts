import { ApplicationError } from '$lib/common/error';
import type { CreateTodo, Todo, UpdateTodo, User } from '$lib/common/schema';
import { applyTodosQuery } from '$lib/common/todo.utils';
import type { GetAllTodos } from '$lib/services/todo-interface.service';
import { db } from './db';

type TodoModel = {
	id: string;
	user_id: string;
	title: string;
	description: string | null;
	emoji: string;
	done: boolean;
	created_at: number;
};

type UserModel = {
	id: string;
	username: string;
	created_at: Date;
};

export async function getTodos(userId: string, query?: GetAllTodos) {
	const todos = await db
		.all<TodoModel[]>('SELECT * FROM todo WHERE user_id = ?', [userId])
		.then((result) => result.map(mapTodo));

	return applyTodosQuery(todos, userId, query);
}

export async function getTodoById(todoId: string) {
	const todo = await db.get<TodoModel>('SELECT * FROM todo WHERE id = ?', [todoId]);

	if (!todo) {
		return null;
	}

	return mapTodo(todo);
}

export async function createTodo(userId: string, input: CreateTodo) {
	const newTodo: Todo = {
		userId,
		id: input.id,
		title: input.title,
		description: input.description,
		emoji: input.emoji,
		createdAt: new Date(),
		done: false
	};

	await db.run(
		`INSERT INTO todo(id, user_id, title, description, emoji, done, created_at) 
		 VALUES(:id, :user_id, :title, :description, :emoji, :done, :created_at)`,
		{
			':id': newTodo.id,
			':user_id': newTodo.userId,
			':title': newTodo.title,
			':description': newTodo.description,
			':emoji': newTodo.emoji,
			':done': Number(newTodo.done),
			':created_at': newTodo.createdAt.getTime()
		}
	);

	return newTodo;
}

export async function updateTodo(userId: string, input: UpdateTodo) {
	const todoToUpdate = await db.get<TodoModel>('SELECT * FROM todo WHERE id = ? AND user_id = ?', [
		input.id,
		userId
	]);

	if (!todoToUpdate) {
		return null;
	}

	if (todoToUpdate.user_id !== userId) {
		return null;
	}

	await db.run(
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

	return mapTodo(todoToUpdate);
}

export async function deleteTodo(userId: string, todoId: string) {
	const deleted = await db.get<TodoModel>(
		'DELETE FROM todo WHERE id = ? AND user_id = ? RETURNING *',
		[todoId, userId]
	);

	if (!deleted) {
		return null;
	}

	return mapTodo(deleted);
}

export async function registerUser(username: string) {
	const alreadyExists = await db
		.get<{ count: number }>('SELECT COUNT(*) as count FROM user WHERE username = ?', [username])
		.then((result) => Boolean(result?.count));

	if (alreadyExists) {
		throw new ApplicationError(400, 'User already exists');
	}

	const user: User = {
		id: crypto.randomUUID(),
		createdAt: new Date(),
		username
	};

	await db.run(
		`INSERT INTO user(id, username, created_at) 
		VALUES (:id, :username, :created_at)`,
		{
			':id': user.id,
			':username': user.username,
			':created_at': user.createdAt.getTime()
		}
	);

	return user;
}

export async function getUser(userId: string) {
	const user = await db.get<UserModel>('SELECT * FROM user WHERE id = ?', [userId]);

	if (!user) {
		return null;
	}

	return mapUser(user);
}

export async function getUserByUsername(username: string) {
	const user = await db.get<UserModel>('SELECT * FROM user WHERE username = ?', [username]);

	if (!user) {
		return null;
	}

	return mapUser(user);
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

function mapTodo(model: TodoModel): Todo {
	return {
		id: model.id,
		userId: model.user_id,
		description: model.description,
		emoji: model.emoji,
		done: Boolean(model.done),
		title: model.title,
		createdAt: new Date(model.created_at)
	};
}

function mapUser(model: UserModel): User {
	return {
		id: model.id,
		username: model.username,
		createdAt: new Date(model.created_at)
	};
}
