<script lang="ts">
	import Loading from '$lib/components/Loading.svelte';
	import type { Todo } from '$lib/common/schema';
	import { createQuery, type CreateQueryOptions } from '@tanstack/svelte-query';
	import { queryKeys } from '$lib/client/query-keys';
	import { inject } from '$lib/client/di';
	import { TodoService } from '$lib/services/todo.service';
	import { page } from '$app/stores';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { storeToRune } from '$lib/runes/storeToRune.svelte';
	import { useDebounce } from '$lib/runes/use-debounce.svelte';

	const todoService = inject(TodoService);
	const todoId = $derived($page.params.todo_id);

	// States
	let search = $state('');
	const debouncedSearch = useDebounce(500, () => search);

	const todosQuery = createQuery(
		storeToRune(() => {
			return {
				queryKey: queryKeys.todos.all(debouncedSearch.value),
				async queryFn() {
					return todoService.getAll({
						filter: {
							search: debouncedSearch.value
						}
					});
				}
			} satisfies CreateQueryOptions;
		})
	);
</script>

{#snippet TodoItem(todo: Todo, delay: number)}
	<a
		data-selected={todoId === todo.id}
		in:fly|global={{ delay, duration: 500, x: -100, opacity: 0, easing: quintOut }}
		class="shadow shadow-neutral-700 border-neutral-500 flex flex-row gap-2 rounded-md items-center border p-2 hover:bg-neutral-700 data-[selected=true]:bg-neutral-700 cursor-pointer text-white"
		href={`/todos/${todo.id}`}
	>
		<span class="text-2xl px-2">{todo.emoji}</span>
		<div class="flex flex-col gap-1">
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
		</div>
	</a>
{/snippet}

<div class="w-full h-full flex flex-col gap-2 p-2">
	<a
		href="/todos/add"
		class="bg-green-500 hover:bg-green-700 text-black font-bold p-2 rounded-md text-lg flex flex-row items-center justify-center shadow my-4"
	>
		Add Todo
	</a>

	<div class="w-full pr-2 mb-2">
		<input
			bind:value={search}
			type="search"
			name="search"
			class="border px-2 py-2 rounded-md shadow w-full"
			placeholder="Search..."
		/>
	</div>

	<div class="w-full h-full overflow-y-auto flex flex-col gap-2 pr-2">
		{#if $todosQuery.isLoading}
			<div class="w-full flex flex-row justify-center">
				<Loading class="size-6 text-green-300" />
			</div>
		{:else if $todosQuery.data}
			{#each $todosQuery.data as todo, index (todo.id)}
				{@render TodoItem(todo, index * 50)}
			{:else}
				<h3 class="w-full text-center font-bold text-lg text-green-200 my-2">No todos</h3>
			{/each}
		{/if}
	</div>
</div>
