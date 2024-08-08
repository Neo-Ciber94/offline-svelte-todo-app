<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { storeToRune } from '$lib/client/storeToRune.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import { todoService } from '$lib/services/todo.service';
	import { createQuery, useQueryClient } from '@tanstack/svelte-query';

	const todoId = $derived($page.params.todo_id);
	const queryClient = useQueryClient();
	let isMutating = $state(false);

	const todoQuery = createQuery(
		storeToRune(() => ({
			queryKey: ['todos', todoId],
			async queryFn() {
				return todoService.getById(todoId);
			}
		}))
	);

	async function handleCompleteTodo() {
		await todoService.update({
			id: todoId,
			done: true
		});

		queryClient.invalidateQueries();
	}

	async function deleteTodo() {
		const data = $todoQuery.data!;

		if (!confirm(`Delete "${data.title}"?`)) {
			return;
		}

		isMutating = true;

		try {
			await todoService.delete(todoId);
			queryClient.invalidateQueries();
			await goto('/todos');
		} finally {
			isMutating = false;
		}
	}
</script>

{#snippet Done(isDone: boolean)}
	<div
		data-done={isDone}
		class="text-sm font-semibold bg-neutral-300 data-[done=true]:bg-green-200 data-[done=true]:text-green-800 px-4 py-2 rounded-2xl shadow"
	>
		{#if isDone}
			<span>Completed</span>
		{:else}
			<span>In Progress</span>
		{/if}
	</div>
{/snippet}

<div class="w-full h-full flex flex-row justify-center items-center">
	{#if $todoQuery.isLoading}
		<Loading class="size-10" />
	{:else if $todoQuery.data}
		{@const todo = $todoQuery.data}

		<div class="flex flex-col w-[95vw] sm:w-[500px] rounded-xl border shadow overflow-hidden">
			<div class="bg-black text-white py-4 px-1 text-xl flex flex-row items-center justify-between">
				<span class="pl-4">
					{todo.title}
				</span>
				<div class="flex flex-row text-sm">
					<button
						disabled={isMutating}
						class="font-semibold text-red-400 disabled:opacity-70 disabled:cursor-not-allowed min-w-16 text-center"
						onclick={deleteTodo}
					>
						Delete
					</button>
					<a
						data-disabled={isMutating}
						class="font-semibold text-orange-400 data-[disabled=true]:cursor-not-allowed min-w-16 text-center"
						href={`/todos/${todo.id}/edit`}
					>
						Edit
					</a>
				</div>
			</div>
			<div class="p-4">
				{#if todo.description}
					<p>
						{todo?.description}
					</p>
				{:else}
					<p class="text-neutral-400 italic">No description</p>
				{/if}

				<div class="mt-4 w-fit">
					{@render Done(todo.done)}
				</div>
			</div>
			{#if !todo.done}
				<button
					disabled={isMutating}
					onclick={handleCompleteTodo}
					class="p-2 bg-neutral-800 hover:bg-neutral-950 text-white rounded-xl shadow text-center mx-2 mb-2 disabled:opacity-70 disabled:cursor-not-allowed"
				>
					<span> Mark as Complete</span>
				</button>
			{/if}
		</div>
	{/if}
</div>
