<script lang="ts">
	import { TodoService } from '$lib/services/todo.service';
	import { inject } from '$lib/client/di';
	import { queryKeys } from '$lib/client/query-keys';
	import { createQuery, useQueryClient } from '@tanstack/svelte-query';
	import { UserService } from '$lib/services/user.service';

	const todoService = inject(TodoService);
	const userService = inject(UserService);
	const queryClient = useQueryClient();

	const userQuery = createQuery({
		queryKey: queryKeys.users.me(),
		queryFn: () => userService.getCurrentUser()
	});

	const isLogged = $derived($userQuery.data != null);

	$effect.pre(() => {
		if (!isLogged) {
			return;
		}

		async function sync() {
			if (!navigator.onLine) {
				return;
			}

			await todoService.synchronize();
			await queryClient.invalidateQueries();
		}

		sync().catch(console.error);

		window.addEventListener('online', sync);
		return () => {
			window.addEventListener('online', sync);
		};
	});
</script>
