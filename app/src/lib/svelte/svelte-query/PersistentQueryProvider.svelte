<script context="module">
	export type PersisterProviderProps = {
		client: QueryClient;
		children: Snippet;
		persistOptions: Omit<PersistQueryClientOptions, 'queryClient'>;
		onSuccess?: () => void;
	};

	let isRestoring = $state(true);

	/**
	 * @internal
	 */
	function setIsRestoring(value: boolean) {
		isRestoring = value;
	}

	export function useIsRestoring() {
		return {
			get value() {
				return isRestoring;
			}
		};
	}
</script>

<script lang="ts">
	import { QueryClient, QueryClientProvider } from '@tanstack/svelte-query';
	import {
		persistQueryClient,
		type Persister,
		type PersistQueryClientOptions
	} from '@tanstack/query-persist-client-core';
	import type { Snippet } from 'svelte';

	const { children, client, onSuccess, ...rest }: PersisterProviderProps = $props();

	$effect(() => {
		let isStale = false;
		setIsRestoring(true);

		const [unsubscribe, promise] = persistQueryClient({
			...rest,
			persister: rest.persistOptions.persister,
			queryClient: client
		});

		promise.then(() => {
			if (!isStale) {
				onSuccess?.();
				setIsRestoring(false);
			}
		});

		return () => {
			isStale = true;
			unsubscribe();
		};
	});
</script>

<QueryClientProvider {client}>
	{@render children()}
</QueryClientProvider>
