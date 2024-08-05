<script lang="ts">
	import { page } from '$app/stores';
	import { storeToRune } from '$lib/client/storeToRune.svelte';
	import Loading from '$lib/components/Loading.svelte';
	import { todosRepository } from '$lib/dal/todos';
	import { createQuery, useQueryClient } from '@tanstack/svelte-query';

	const todoId = $derived($page.params.todo_id);
	const queryClient = useQueryClient();

	const todoQuery = createQuery(
		storeToRune(() => ({
			queryKey: ['todos', todoId],
			async queryFn() {
				return todosRepository.getById(todoId);
			}
		}))
	);

	async function handleCompleteTodo() {
		await todosRepository.update({
			id: todoId,
			done: true
		});

		queryClient.invalidateQueries();
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
			<div class="bg-black text-white p-4 text-xl flex flex-row items-center justify-between">
				<span>
					{todo.title}
				</span>
				<a class="font-semibold text-orange-400" href={`/todos/${todo.id}/edit`}>Edit</a>
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
					onclick={handleCompleteTodo}
					class="p-2 bg-neutral-800 hover:bg-neutral-950 text-white rounded-xl shadow text-center mx-2 mb-2"
				>
					<span> Mark as Complete</span>
				</button>
			{/if}
		</div>
	{/if}
</div>
