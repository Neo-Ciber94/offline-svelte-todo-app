<script lang="ts">
	import '../app.css';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import type { Snippet } from 'svelte';
	import Header from './Header.svelte';

	type Props = {
		children: Snippet;
	};

	const { children }: Props = $props();
	const queryClient = new QueryClient();
</script>

<svelte:head>
	<title>TodoApp</title>
</svelte:head>

<Header />
<QueryClientProvider client={queryClient}>
	{@render children()}
</QueryClientProvider>
