<script lang="ts">
	import { queryKeys } from '$lib/client/query-keys';
	import { inject } from '$lib/client/di';
	import { UserService } from '$lib/services/user.service';
	import { createQuery } from '@tanstack/svelte-query';
	import Loading from '$lib/components/Loading.svelte';
	import { tick } from 'svelte';

	const userService = inject(UserService);
	const userQuery = createQuery({
		queryKey: queryKeys.users.me(),
		queryFn: () => userService.getCurrentUser()
	});

	let visible = $state(false);

	$effect(() => {
		tick().then(() => {
			visible = true;
		});
	});
</script>

<div class="w-full h-[calc(100vh-var(--header-height))] flex flex-col justify-center items-center">
	<div class="max-w-3xl px-4 md:px-6 text-center">
		<h1
			data-visible={visible}
			class={`text-xl sm:text-3xl md:text-6xl font-bold mb-4 
					-translate-y-10 opacity-0 data-[visible=true]:opacity-100 data-[visible=true]:translate-y-0 transition duration-1000 delay-0`}
		>
			Never Lose Your Tasks - Our Offline-First Todo App Has Got You Covered
		</h1>
		<p
			data-visible={visible}
			class="text-base md:text-lg mb-8 -translate-x-10 data-[visible=true]:translate-x-0 opacity-0 data-[visible=true]:opacity-100 transition duration-1000 delay-200"
		>
			Access your tasks anytime, anywhere, even without an internet connection.
		</p>
		<a
			data-visible={visible}
			href={$userQuery.data ? '/todos' : '/login'}
			class={`inline-flex items-center justify-center h-12 px-8 min-w-44 rounded-md text-white font-medium bg-green-500 hover:bg-green-600 text-lg 
					opacity-0 data-[visible=true]:opacity-100 transition duration-1000 delay-200 data-[visible=true]:translate-y-0 translate-y-5 animate-grow
					focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2`}
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

<style>
	:global(body) {
		overflow-y: hidden;
	}

	@keyframes growAnimation {
		0%,
		100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.05);
		}
	}

	.animate-grow:hover {
		animation: growAnimation 1s infinite;
	}
</style>
