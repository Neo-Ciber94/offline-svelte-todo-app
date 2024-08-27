<script lang="ts">
	import { getDb } from '$lib/client/db';
	import { TodoRepository } from '$lib/data/todo.repository';
	import { inject } from '$lib/services/di';
	import { TodoService } from '$lib/services/todo.service';
	import { UserService } from '$lib/services/user.service';

	const userService = inject(UserService);
	const todosService = inject(TodoService)

	$effect(() => {
		async function run() {
			await todosService.synchronize();
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
