import { TodoRepository } from '$lib/data/todo.repository';
import { DependencyContainer, InjectionToken } from '$lib/services/dependency-container';
import { ConnectivityService } from '$lib/services/network-service';
import { LocalTodoService } from '$lib/services/todo-local.service';
import { NetworkTodoService } from '$lib/services/todo-network.service';
import { TodoQueueService } from '$lib/services/todo-queue.service';
import { TodoService } from '$lib/services/todo.service';
import { UserService } from '$lib/services/user.service';
import { getDb } from './db';

const container = new DependencyContainer();

const todoRepositoryDep = InjectionToken.fromSingleton('todosRepository', () =>
	getDb().then((db) => new TodoRepository(db))
);

export const todoRepositoryToken = todoRepositoryDep.token;

// Declare dependencies
container.register(ConnectivityService);
container.register(LocalTodoService);
container.register(NetworkTodoService);
container.register(UserService);
container.register(TodoService);
container.register(TodoQueueService);
container.registerWith(todoRepositoryDep.token, todoRepositoryDep.provider);

// Global function to inject dependencies
export const inject = container.inject.bind(container);
