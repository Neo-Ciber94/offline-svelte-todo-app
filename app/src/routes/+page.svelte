<script lang="ts">
	import { queryKeys } from '$lib/client/query-keys';
	import { inject } from '$lib/services/di';
	import { UserService } from '$lib/services/user.service';
	import { createQuery } from '@tanstack/svelte-query';
	import Loading from '$lib/components/Loading.svelte';

	const userService = inject(UserService);
	const userQuery = createQuery({
		queryKey: queryKeys.users.me(),
		queryFn: () => userService.getCurrentUser()
	});
</script>

<div class="w-full h-[calc(100vh-var(--header-height))] flex flex-col justify-center items-center">
	<div class="max-w-3xl px-4 md:px-6 text-center">
		<h1 class="text-xl sm:text-3xl md:text-6xl font-bold mb-4">
			Never Lose Your Tasks - Our Offline-First Todo App Has Got You Covered
		</h1>
		<p class="text-base md:text-lg mb-8">
			Access your tasks anytime, anywhere, even without an internet connection.
		</p>
		<a
			class="inline-flex items-center justify-center h-12 px-8 min-w-44 rounded-md text-white font-medium bg-green-500 hover:bg-green-600 text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
			href={$userQuery.data ? '/todos' : '/login'}
		>
			{#if $userQuery.isLoading}
				<Loading class="size-5" />
			{:else if $userQuery.data}
				Go to Todos
			{:else}
				Get Started
			{/if}
		</a>
	</div>
</div>
