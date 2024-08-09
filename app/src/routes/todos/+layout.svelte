<script lang="ts">
	import type { Snippet } from 'svelte';
	import Sidebar from '../Sidebar.svelte';

	type Props = {
		children: Snippet;
	};

	const { children }: Props = $props();
</script>

<main class="flex flex-row w-full h-[calc(100vh-4rem)]">
	<Sidebar />

	<div class="w-full h-full">
		{@render children()}
	</div>
</main>
