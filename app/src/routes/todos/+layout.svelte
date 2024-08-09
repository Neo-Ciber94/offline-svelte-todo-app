<script lang="ts">
	import type { Snippet } from 'svelte';
	import TodoList from './TodoList.svelte';

	type Props = {
		children: Snippet;
	};

	const { children }: Props = $props();
</script>

<main class="flex flex-row w-full h-[calc(100vh-4rem)]">
	<aside
		class="fixed top-0 left-0 h-full lg:static shrink-0 w-[400px] border-r border-neutral-200 bg-white shadow z-10 lg:z-auto"
	>
		<a
			href="/todos"
			class="font-bold text-2xl text-green-500 mt-5 pb-2 lg:hidden flex flex-row gap-2 w-full justify-center items-center"
		>
			<img src="/todo-app.png" alt="logo" class="size-7" />
			<span>TodoApp</span>
		</a>
		<div class="h-full overflow-y-auto">
			<TodoList />
		</div>
	</aside>

	<div class="w-full h-full">
		{@render children()}
	</div>
</main>
