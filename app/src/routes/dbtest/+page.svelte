<script lang="ts">
	import { getDb } from '$lib/client/db';
	import { TodoRepository } from '$lib/data/todo.repository';
	import { inject } from '$lib/services/di';
	import { UserService } from '$lib/services/user.service';

	const userService = inject(UserService);

	$effect(() => {
		async function run() {
			const user = await userService.getCurrentUser();

			const db = await getDb();
			const repo = new TodoRepository(db);

			const todos = await repo.getTodos(user!.id);
			console.log({
				todos
			});
		}

        run()
	});
</script>
