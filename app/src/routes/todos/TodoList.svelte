<script lang="ts">
	import Loading from '$lib/components/Loading.svelte';
	import { todoService } from '$lib/services/todo.service';
	import type { Todo } from '$lib/common/schema';
	import { createQuery } from '@tanstack/svelte-query';
	import { queryKeys } from '$lib/client/query-keys';

	const todosQuery = createQuery({
		queryKey: queryKeys.todos.all(),
		async queryFn() {
			return todoService.getAll();
		}
	});
</script>

{#snippet TodoItem(todo: Todo)}
	<a
		class="shadow flex flex-col gap-1 rounded-md border p-2 hover:bg-neutral-200 cursor-pointer"
		href={`/todos/${todo.id}`}
	>
		<h3
			data-done={todo.done}
			class="font-bold data-[done=true]:line-through data-[done=true]:opacity-40"
		>
			{todo.title}
		</h3>
		{#if todo.description}
			<p
				data-done={todo.done}
				class="text-sm data-[done=true]:line-through data-[done=true]:opacity-40 whitespace-nowrap overflow-hidden text-ellipsis"
			>
				{todo.description}
			</p>
		{/if}
	</a>
{/snippet}

<div class="w-full h-full flex flex-col gap-2 p-2">
	<a
		href="/todos/add"
		class="bg-neutral-800 hover:bg-neutral-950 text-white p-2 rounded-md text-lg flex flex-row items-center justify-center shadow my-4"
	>
		Add Todo
	</a>

	{#if $todosQuery.isLoading}
		<div class="w-full flex flex-row justify-center">
			<Loading class="size-6" />
		</div>
	{:else if $todosQuery.data}
		{#each $todosQuery.data as todo (todo.id)}
			{@render TodoItem(todo)}
		{:else}
			<h3 class="w-full text-center font-bold text-lg text-neutral-400 my-2">No todos</h3>
		{/each}
	{/if}
</div>
