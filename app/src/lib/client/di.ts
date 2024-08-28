import { DependencyContainer } from '$lib/services/dependency-container';
import { ConnectivityService } from '$lib/services/network-service';
import { LocalTodoService } from '$lib/services/todo-local.service';
import { NetworkTodoService } from '$lib/services/todo-network.service';
import { TodoQueueService } from '$lib/services/todo-queue.service';
import { TodoService } from '$lib/services/todo.service';
import { UserService } from '$lib/services/user.service';

const container = new DependencyContainer();
container.register(ConnectivityService);
container.register(LocalTodoService);
container.register(NetworkTodoService);
container.register(UserService);
container.register(TodoService);
container.register(TodoQueueService);

export const inject = container.inject.bind(container);
