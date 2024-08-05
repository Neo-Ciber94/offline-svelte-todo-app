<script lang="ts">
	import Loading from '$lib/components/Loading.svelte';
	import { todosRepository } from '$lib/dal';
	import type { Todo } from '$lib/data';
	import { createQuery } from '@tanstack/svelte-query';

	// const todos: Todo[] = [
	// 	{
	// 		id: '1',
	// 		userId: 'user123',
	// 		title: 'Buy groceries',
	// 		description: 'Milk, Bread, Eggs, Butter',
	// 		done: false,
	// 		createdAt: new Date()
	// 	},
	// 	{
	// 		id: '2',
	// 		userId: 'user123',
	// 		title: 'Workout',
	// 		description: '1 hour at the gym',
	// 		done: false,
	// 		createdAt: new Date()
	// 	},
	// 	{
	// 		id: '3',
	// 		userId: 'user123',
	// 		title: 'Read a book',
	// 		description: "Finish reading 'Atomic Habits'",
	// 		done: true,
	// 		createdAt: new Date()
	// 	},
	// 	{
	// 		id: '4',
	// 		userId: 'user123',
	// 		title: 'Call mom',
	// 		description: 'Weekly catch-up call',
	// 		done: false,
	// 		createdAt: new Date()
	// 	},
	// 	{
	// 		id: '5',
	// 		userId: 'user123',
	// 		title: 'Prepare dinner',
	// 		description: 'Cook spaghetti bolognese',
	// 		done: false,
	// 		createdAt: new Date()
	// 	},
	// 	{
	// 		id: '6',
	// 		userId: 'user123',
	// 		title: 'Write blog post',
	// 		description: 'Post about recent travel experiences',
	// 		done: false,
	// 		createdAt: new Date()
	// 	},
	// 	{
	// 		id: '7',
	// 		userId: 'user123',
	// 		title: 'Attend team meeting',
	// 		description: 'Project status update',
	// 		done: true,
	// 		createdAt: new Date()
	// 	},
	// 	{
	// 		id: '8',
	// 		userId: 'user123',
	// 		title: 'Pay bills',
	// 		description: 'Electricity and water bills',
	// 		done: false,
	// 		createdAt: new Date()
	// 	},
	// 	{
	// 		id: '9',
	// 		userId: 'user123',
	// 		title: 'Plan vacation',
	// 		description: 'Research destinations and book flights',
	// 		done: false,
	// 		createdAt: new Date()
	// 	},
	// 	{
	// 		id: '10',
	// 		userId: 'user123',
	// 		title: 'Clean the house',
	// 		description: 'Vacuum and dust all rooms',
	// 		done: true,
	// 		createdAt: new Date()
	// 	}
	// ];

	const todosQuery = createQuery({
		queryKey: ['todos'],
		async queryFn() {
			return todosRepository.getAll();
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
				class="text-sm data-[done=true]:line-through data-[done=true]:opacity-40"
			>
				{todo.description}
			</p>
		{/if}
	</a>
{/snippet}

<div class="w-full h-full flex flex-col gap-2 p-2">
	<a
		href="/todos/add"
		class="bg-neutral-800 hover:bg-neutral-950 text-white p-2 rounded-md text-lg flex flex-row items-center justify-center shadow"
	>
		Add Todo
	</a>

	{#if $todosQuery.isLoading}
		<Loading class="size-6" />
	{:else if $todosQuery.data}
		{#each $todosQuery.data as todo (todo.id)}
			{@render TodoItem(todo)}
		{:else}
			<h3 class="w-full text-center font-bold text-lg text-neutral-400 my-2">No todos</h3>
		{/each}
	{/if}
</div>
