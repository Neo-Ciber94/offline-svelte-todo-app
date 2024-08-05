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
		class="fixed top-0 left-0 h-screen md:static md:w-[400px] border-r border-neutral-200 bg-white shadow z-10 md:z-0"
	>
		<a
			href="/todos"
			class="font-bold text-2xl text-blue-500 mt-5 pb-2 md:hidden block w-full text-center"
		>
			TodoApp
		</a>
		<div class="h-full overflow-y-auto">
			<TodoList />
		</div>
	</aside>

	<div class="w-full h-full">
		{@render children()}
	</div>
</main>
