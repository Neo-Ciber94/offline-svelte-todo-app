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
	import { runeToStore } from '$lib/runes/runeToStore.svelte';
	import { useDebounce } from '$lib/runes/use-debounce.svelte';

	type TodoState = 'completed' | 'pending';

	const todoService = inject(TodoService);
	const todoId = $derived($page.params.todo_id);

	// States
	let search = $state('');
	let todoState = $state<TodoState>();

	const filterByDone = $derived.by(() => {
		switch (todoState) {
			case 'completed': {
				return true;
			}
			case 'pending': {
				return false;
			}
			default: {
				return undefined;
			}
		}
	});

	const debouncedFilter = useDebounce(500, () => ({ search, filterByDone }));

	function handleStateChange(
		ev: Event & {
			currentTarget: HTMLSelectElement;
		}
	) {
		todoState = ev.currentTarget.value as TodoState;
	}

	const todosQuery = createQuery(
		runeToStore(() => {
			return {
				queryKey: queryKeys.todos.all(
					debouncedFilter.value.filterByDone,
					debouncedFilter.value.search
				),
				async queryFn() {
					return todoService.getAll({
						filter: {
							search: debouncedFilter.value.search,
							done: debouncedFilter.value.filterByDone
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

	<div class="w-full pr-2 mb-2 flex flex-row gap-2">
		<div class="relative w-full basis-3/4">
			<input
				bind:value={search}
				type="search"
				name="search"
				class="border px-2 py-2 rounded-md shadow w-full pl-10"
				placeholder="Search..."
			/>

			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="absolute left-2 top-1/2 size-6 text-gray-400 -translate-y-1/2"
				viewBox="0 0 24 24"
				><path
					fill="none"
					stroke="currentColor"
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0-14 0m18 11l-6-6"
				/></svg
			>
		</div>

		<select class="border px-2 py-2 rounded-md shadow basis-1/4" onchange={handleStateChange}>
			<option value={undefined}>All</option>
			<option value="completed">Completed</option>
			<option value="pending">Pending</option>
		</select>
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
