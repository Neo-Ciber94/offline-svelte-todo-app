<script lang="ts">
	import '../app.css';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import type { Snippet } from 'svelte';
	import Header from './Header.svelte';
	import { beforeNavigate, goto } from '$app/navigation';
	import { PUBLIC_ROUTES } from '$lib/common/constants';
	import { inject } from '$lib/services/di';
	import { TodoService } from '$lib/services/todo.service';
	import { UserService } from '$lib/services/user.service';
	import { TodoQueueService } from '$lib/services/todo-queue.service';

	type Props = {
		children: Snippet;
	};

	const { children }: Props = $props();

	const todoService = inject(TodoService);
	const userService = inject(UserService);
	const todoQueueService = inject(TodoQueueService);

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: 1,
				staleTime: Infinity
			}
		}
	});

	let isRedirecting = $state(false);

	$effect.pre(() => {
		const run = async () => {
			const { registerSW } = await import('virtual:pwa-register');
			registerSW({
				immediate: true,
				onRegisteredSW(scriptUrl) {
					console.log(`SW Registered: ${scriptUrl}`);
				},
				onRegisterError(error) {
					console.log('SW registration error', error);
				}
			});
		};

		run().catch(console.error);
	});

	$effect.pre(() => {
		todoService.synchronize().catch(console.error);
	});

	$effect.pre(() => {
		async function runPendingTodos() {
			if (!navigator.onLine) {
				return;
			}

			await todoQueueService.runPending();
		}

		// First run
		runPendingTodos();

		window.addEventListener('online', runPendingTodos);
		return () => {
			window.addEventListener('online', runPendingTodos);
		};
	});

	beforeNavigate(async ({ cancel, to }) => {
		if (!to || isRedirecting) {
			return;
		}

		// We cancel first to prevent flickering
		cancel();
		isRedirecting = true;

		try {
			const pathname = to.url.pathname ?? '';
			const user = await userService.getCurrentUser();

			if (!user && !PUBLIC_ROUTES.some((p) => pathname.startsWith(p))) {
				await goto('/login');
			} else {
				await goto(to.url.toString());
			}
		} finally {
			isRedirecting = false;
		}
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
