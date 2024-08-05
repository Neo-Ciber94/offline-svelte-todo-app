<script lang="ts">
	import type { Todo } from '$lib/data';

	const todos: Todo[] = [
		{
			id: '1',
			userId: 'user123',
			title: 'Buy groceries',
			description: 'Milk, Bread, Eggs, Butter',
			done: false,
			createdAt: new Date()
		},
		{
			id: '2',
			userId: 'user123',
			title: 'Workout',
			description: '1 hour at the gym',
			done: false,
			createdAt: new Date()
		},
		{
			id: '3',
			userId: 'user123',
			title: 'Read a book',
			description: "Finish reading 'Atomic Habits'",
			done: true,
			createdAt: new Date()
		},
		{
			id: '4',
			userId: 'user123',
			title: 'Call mom',
			description: 'Weekly catch-up call',
			done: false,
			createdAt: new Date()
		},
		{
			id: '5',
			userId: 'user123',
			title: 'Prepare dinner',
			description: 'Cook spaghetti bolognese',
			done: false,
			createdAt: new Date()
		},
		{
			id: '6',
			userId: 'user123',
			title: 'Write blog post',
			description: 'Post about recent travel experiences',
			done: false,
			createdAt: new Date()
		},
		{
			id: '7',
			userId: 'user123',
			title: 'Attend team meeting',
			description: 'Project status update',
			done: true,
			createdAt: new Date()
		},
		{
			id: '8',
			userId: 'user123',
			title: 'Pay bills',
			description: 'Electricity and water bills',
			done: false,
			createdAt: new Date()
		},
		{
			id: '9',
			userId: 'user123',
			title: 'Plan vacation',
			description: 'Research destinations and book flights',
			done: false,
			createdAt: new Date()
		},
		{
			id: '10',
			userId: 'user123',
			title: 'Clean the house',
			description: 'Vacuum and dust all rooms',
			done: true,
			createdAt: new Date()
		}
	];
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
	{#each todos as todo (todo.id)}
		{@render TodoItem(todo)}
	{/each}
</div>
