import { DependencyContainer } from './dependency-container';
import { ConnectivityService } from './network-service';
import { LocalTodoService } from './todo-local.service';
import { NetworkTodoService } from './todo-network.service';
import { TodoQueueService } from './todo-queue.service';
import { TodoService } from './todo.service';
import { UserService } from './user.service';

const container = new DependencyContainer();
container.register(ConnectivityService);
container.register(LocalTodoService);
container.register(NetworkTodoService);
container.register(UserService);
container.register(TodoService);
container.register(TodoQueueService);

export const inject = container.inject.bind(container);
