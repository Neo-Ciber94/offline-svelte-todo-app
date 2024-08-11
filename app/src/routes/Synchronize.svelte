<script lang="ts">
	import { TodoQueueService } from '$lib/services/todo-queue.service';
	import { TodoService } from '$lib/services/todo.service';
	import { inject } from '$lib/services/di';
	import { queryKeys } from '$lib/client/query-keys';
	import { createQuery } from '@tanstack/svelte-query';
	import { UserService } from '$lib/services/user.service';

	const todoService = inject(TodoService);
	const todoQueueService = inject(TodoQueueService);
	const userService = inject(UserService);

	const userQuery = createQuery({
		queryKey: queryKeys.users.me(),
		queryFn: () => userService.getCurrentUser()
	});

	const isLogged = $derived($userQuery.data != null);

	$effect.pre(() => {
		if (isLogged) {
			todoService.synchronize().catch(console.error);
		}
	});

	$effect.pre(() => {
		if (!isLogged) {
			return;
		}

		async function runPendingTodos() {
			if (!navigator.onLine) {
				return;
			}

			await todoQueueService.runPending();
		}

		// First run
		runPendingTodos();

		window.addEventListener('online', runPendingTodos);
		return () => {
			window.addEventListener('online', runPendingTodos);
		};
	});
</script>
