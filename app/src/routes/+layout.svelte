<script lang="ts">
	import '../app.css';
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import type { Snippet } from 'svelte';
	import Header from './Header.svelte';
	import { beforeNavigate, goto } from '$app/navigation';
	import { PUBLIC_ROUTES } from '$lib/common/constants';
	import { inject } from '$lib/services/di';
	import { UserService } from '$lib/services/user.service';
	import ConnectivityIndicator from './ConnectivityIndicator.svelte';
	import Synchronize from './Synchronize.svelte';
	import { dev } from '$app/environment';

	type Props = {
		children: Snippet;
	};

	const { children }: Props = $props();
	const userService = inject(UserService);

	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				retry: 1,
				staleTime: Infinity,
				networkMode: 'offlineFirst'
			}
		}
	});

	let isRedirecting = $state(false);

	$effect.pre(() => {
		if (dev) {
			return;
		}

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
	<Synchronize />
	{@render children()}
</QueryClientProvider>

<ConnectivityIndicator />
