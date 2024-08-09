<script lang="ts">
	import { goto } from '$app/navigation';
	import { ApplicationError } from '$lib/common/error';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import { inject } from '$lib/services/di';
	import { TodoService } from '$lib/services/todo.service';
	import { useQueryClient } from '@tanstack/svelte-query';

	let title = $state('');
	let description = $state('');
	let isMutating = $state(false);
	let error = $state<string>();

	const todoService = inject(TodoService);
	const queryClient = useQueryClient();

	async function handleAddTodo(ev: SubmitEvent) {
		ev.preventDefault();
		error = undefined;
		isMutating = true;

		try {
			const result = await todoService.insert({
				title,
				description
			});

			queryClient.invalidateQueries();
			await goto(`/todos/${result.id}`);
		} catch (err) {
			error = err instanceof ApplicationError ? err.message : 'Failed to add todo';
		} finally {
			isMutating = false;
		}
	}
</script>

<div class="w-full h-[75vh] flex flex-col justify-center items-center">
	<form
		onsubmit={handleAddTodo}
		class="w-[95vw] sm:w-[500px] flex flex-col gap-2 shadow border p-4 rounded-md"
	>
		<h2 class="font-bold text-2xl">Add Todo</h2>
		<input
			disabled={isMutating}
			bind:value={title}
			name="username"
			class="border px-2 py-1 rounded-md shadow"
			placeholder="Title"
			required
		/>
		<textarea
			disabled={isMutating}
			bind:value={description}
			name="description"
			class="border px-2 py-1 rounded-md shadow"
			placeholder="Description"
			rows={5}
		></textarea>
		<button
			disabled={isMutating}
			class="bg-black text-white p-2 rounded-md disabled:opacity-70 disabled:cursor-not-allowed"
		>
			Add
		</button>

		{#if error}
			<ErrorAlert {error} />
		{/if}
	</form>
</div>
