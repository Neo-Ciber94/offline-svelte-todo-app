<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { queryKeys } from '$lib/client/query-keys';
	import { storeToRune } from '$lib/runes/storeToRune.svelte';
	import { ApplicationError } from '$lib/common/error';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import { inject } from '$lib/services/di';
	import { TodoService } from '$lib/services/todo.service';
	import { createQuery, useQueryClient, type CreateQueryOptions } from '@tanstack/svelte-query';

	const todoService = inject(TodoService);
	const queryClient = useQueryClient();
	const todoId = $derived($page.params.todo_id);

	const todoQuery = createQuery(
		storeToRune(() => {
			return {
				queryKey: queryKeys.todos.one(todoId),
				queryFn: () => todoService.getById(todoId)
			} satisfies CreateQueryOptions;
		})
	);

	let title = $state('');
	let description = $state<string>();
	let isDone = $state(false);

	// ui state
	let isMutating = $state(false);
	let error = $state<string>();

	$effect(() => {
		const data = $todoQuery.data;
		if (data) {
			title = data.title;
			description = data.description ?? undefined;
			isDone = data.done;
		}
	});

	async function handleEdit(ev: SubmitEvent) {
		ev.preventDefault();
		error = undefined;
		isMutating = true;

		try {
			await todoService.update({
				id: todoId,
				title,
				description,
				done: isDone
			});

			queryClient.invalidateQueries();
			await goto(`/todos/${todoId}`);
		} catch (err) {
			error = err instanceof ApplicationError ? err.message : 'Failed to update todo';
		} finally {
			isMutating = false;
		}
	}
</script>

<div class="w-full h-[75vh] flex flex-col justify-center items-center">
	<form
		onsubmit={handleEdit}
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

		<label class="flex flex-row items-center gap-2 my-2 ml-1">
			<input type="checkbox" name="done" class="accent-neutral-700 size-5" bind:checked={isDone} />
			<span>Done</span>
		</label>

		<button
			disabled={isMutating}
			class="bg-black text-white p-2 rounded-md disabled:opacity-70 disabled:cursor-not-allowed"
		>
			Update
		</button>

		{#if error}
			<ErrorAlert {error} />
		{/if}
	</form>
</div>
