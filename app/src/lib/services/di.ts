import { DependencyContainer } from './dependency-container';
import { NetworkService, NetworkServiceInterface } from './network-service';
import { LocalTodoService } from './todo-local.service';
import { NetworkTodoService } from './todo-network.service';
import { TodoQueueService } from './todo-queue.service';
import { TodoService } from './todo.service';
import { UserService } from './user.service';

const GLOBAL_CONTAINER = new DependencyContainer();
GLOBAL_CONTAINER.register(NetworkServiceInterface, { as: NetworkService });
GLOBAL_CONTAINER.register(LocalTodoService);
GLOBAL_CONTAINER.register(NetworkTodoService);
GLOBAL_CONTAINER.register(UserService);
GLOBAL_CONTAINER.register(TodoService);
GLOBAL_CONTAINER.register(TodoQueueService);

export const inject = GLOBAL_CONTAINER.inject.bind(GLOBAL_CONTAINER);
