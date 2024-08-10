<script lang="ts">
	import { queryKeys } from '$lib/client/query-keys';
	import Loading from '$lib/components/Loading.svelte';
	import { useIsOnline } from '$lib/runes/use-is-online.svelte';
	import { inject } from '$lib/services/di';
	import { UserService } from '$lib/services/user.service';
	import { createQuery } from '@tanstack/svelte-query';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { useClickOutside } from '$lib/runes/use-click-outside.svelte';

	const userService = inject(UserService);
	const online = useIsOnline();

	let isUserMenuOpen = $state(false);
	let menuRef = $state<HTMLElement>();

	useClickOutside(
		() => menuRef,
		() => {
			isUserMenuOpen = false;
		}
	);

	const userQuery = createQuery({
		queryKey: queryKeys.users.me(),
		queryFn() {
			return userService.getCurrentUser();
		}
	});

	$effect.pre(() => {
		function handleKeyDown(ev: KeyboardEvent) {
			if (ev.key === 'Escape') {
				isUserMenuOpen = false;
			}
		}

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});

	function handleLogout(ev: Event) {
		if (!confirm('Want to logout?')) {
			return ev.preventDefault();
		}

		if (!online.isOnline) {
			// We need to go to the backend to remove the cookie,
			// alternatively we could expose the cookie to the client so we can wipe it client side instead
			alert('Unable to logout while offline');
			ev.preventDefault();
		} else {
			isUserMenuOpen = false;
		}
	}
</script>

{#snippet UserIcon()}
	<svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-green-500" viewBox="0 0 24 24">
		<path
			fill="currentColor"
			d="M12 19.2c-2.5 0-4.71-1.28-6-3.2c.03-2 4-3.1 6-3.1s5.97 1.1 6 3.1a7.23 7.23 0 0 1-6 3.2M12 5a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m0-3A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10c0-5.53-4.5-10-10-10"
		/>
	</svg>
{/snippet}

{#snippet LogoutIcon()}
	<svg xmlns="http://www.w3.org/2000/svg" class="size-6 text-green-500" viewBox="0 0 24 24">
		<path
			fill="currentColor"
			d="M4 18h2v2h12V4H6v2H4V3a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1zm2-7h7v2H6v3l-5-4l5-4z"
		/>
	</svg>
{/snippet}

{#if $userQuery.isLoading}
	<Loading class="size-5" />
{:else if $userQuery.data}
	{@const initials = $userQuery.data.username.toUpperCase().slice(0, 2)}

	<button
		bind:this={menuRef}
		onclick={() => {
			isUserMenuOpen = true;
		}}
		class="relative size-10 rounded-full bg-emerald-500 text-white font-bold text-xl font-mono flex flex-row items-center justify-center shadow outline-none"
	>
		{initials}

		{#if isUserMenuOpen}
			<div
				transition:fly={{
					duration: 500,
					y: 50,
					opacity: 0,
					easing: quintOut
				}}
				class="flex flex-col absolute bg-white text-black shadow rounded-md text-base top-12 min-w-0 w-[80vw] md:min-w-40 right-0 py-1"
			>
				<span
					class="text-left px-4 py-3 md:py-2 hover:bg-neutral-100 flex flex-row gap-2 items-cente"
				>
					{@render UserIcon()}
					{$userQuery.data.username}</span
				>
				<hr class="w-full bg-neutral-400" />
				<a
					class="text-left px-4 py-3 md:py-2 hover:bg-neutral-100 flex flex-row gap-2 items-center"
					onclick={handleLogout}
					href="/api/users/logout"
				>
					{@render LogoutIcon()}
					Logout
				</a>
			</div>
		{/if}
	</button>
{/if}
