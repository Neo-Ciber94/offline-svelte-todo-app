<script lang="ts">
	import type { Snippet } from 'svelte';
	import TodoList from './TodoList.svelte';

	type Props = {
		children: Snippet;
	};

	const { children }: Props = $props();
</script>

<main class="flex flex-row w-full h-[calc(100vh-4rem)]">
	<aside class="w-[400px] border-r border-neutral-200">
		<TodoList />
	</aside>

	<div class="w-full h-full">
		{@render children()}
	</div>
</main>
