<script lang="ts">
	import Loading from '$lib/components/Loading.svelte';
	import type { Todo } from '$lib/common/schema';
	import { createQuery } from '@tanstack/svelte-query';
	import { queryKeys } from '$lib/client/query-keys';
	import { inject } from '$lib/services/di';
	import { TodoService } from '$lib/services/todo.service';
	import { page } from '$app/stores';

	const todoService = inject(TodoService);
	const todoId = $derived($page.params.todo_id);

	const todosQuery = createQuery({
		queryKey: queryKeys.todos.all(),
		async queryFn() {
			const result = await todoService.getAll();
			// return Array(100).fill(result[1]);
			return result;
		}
	});
</script>

{#snippet TodoItem(todo: Todo)}
	<a
		data-selected={todoId === todo.id}
		class="shadow shadow-green-700 border-green-500 flex flex-col gap-1 rounded-md border p-2 hover:bg-green-900 data-[selected=true]:bg-green-900 cursor-pointer text-white"
		href={`/todos/${todo.id}`}
	>
		<h3
			data-done={todo.done}
			class="font-bold data-[done=true]:line-through data-[done=true]:opacity-70"
		>
			{todo.title}
		</h3>
		{#if todo.description}
			<p
				data-done={todo.done}
				class="text-sm data-[done=true]:line-through data-[done=true]:opacity-70 whitespace-nowrap overflow-hidden text-ellipsis"
			>
				{todo.description}
			</p>
		{/if}
	</a>
{/snippet}

<div class="w-full h-full flex flex-col gap-2 p-2">
	<a
		href="/todos/add"
		class="bg-green-500 hover:bg-green-700 text-black font-bold p-2 rounded-md text-lg flex flex-row items-center justify-center shadow my-4"
	>
		Add Todo
	</a>

	<div class="w-full h-full overflow-y-auto flex flex-col gap-2">
		{#if $todosQuery.isLoading}
			<div class="w-full flex flex-row justify-center">
				<Loading class="size-6" />
			</div>
		{:else if $todosQuery.data}
			{#each $todosQuery.data as todo}
				{@render TodoItem(todo)}
			{:else}
				<h3 class="w-full text-center font-bold text-lg text-green-200 my-2">No todos</h3>
			{/each}
		{/if}
	</div>
</div>
