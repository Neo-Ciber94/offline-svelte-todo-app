<script lang="ts">
	import '../app.css';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import type { Snippet } from 'svelte';
	import Header from './Header.svelte';
	import { beforeNavigate, goto } from '$app/navigation';
	import { userRepository } from '$lib/dal/user';
	import { PUBLIC_ROUTES } from '$lib/common/constants';
	import { pendingTodosQueue } from '$lib/dal/pending-todos-queue';
	import { todosRepository } from '$lib/dal/todos';

	type Props = {
		children: Snippet;
	};

	const { children }: Props = $props();
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: 1,
				staleTime: Infinity
			}
		}
	});

	let isRedirecting = $state(false);

	beforeNavigate(async ({ cancel, to }) => {
		if (!to || isRedirecting) {
			return;
		}

		// We cancel first to prevent flickering
		cancel();
		isRedirecting = true;

		try {
			const pathname = to.url.pathname ?? '';
			const user = await userRepository.getCurrentUser();

			if (!user && !PUBLIC_ROUTES.some((p) => pathname.startsWith(p))) {
				await goto('/login');
			} else {
				await goto(to.url.toString());
			}
		} finally {
			isRedirecting = false;
		}
	});

	$effect.pre(() => {
		todosRepository.synchronize().catch(console.error);
	});

	$effect.pre(() => {
		async function runPendingTodos() {
			if (!navigator.onLine) {
				return;
			}

			await pendingTodosQueue.runPending();
		}

		// First run
		runPendingTodos();

		window.addEventListener('online', runPendingTodos);
		return () => {
			window.addEventListener('online', runPendingTodos);
		};
	});
</script>

<svelte:head>
	<title>TodoApp</title>
	<link rel="manifest" href="/manifest.json" />
</svelte:head>

<QueryClientProvider client={queryClient}>
	<Header />
	{@render children()}
</QueryClientProvider>
