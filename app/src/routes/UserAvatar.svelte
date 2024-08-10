<script lang="ts">
	import { queryKeys } from '$lib/client/query-keys';
	import Loading from '$lib/components/Loading.svelte';
	import { useIsOnline } from '$lib/runes/use-is-online.svelte';
	import { inject } from '$lib/services/di';
	import { UserService } from '$lib/services/user.service';
	import { createQuery } from '@tanstack/svelte-query';

	const userService = inject(UserService);
	const online = useIsOnline();

	const userQuery = createQuery({
		queryKey: queryKeys.users.me(),
		queryFn() {
			return userService.getCurrentUser();
		}
	});

	function handleLogout(ev: Event) {
		if (!online.isOnline) {
			// We need to go to the backend to remove the cookie, 
			// alternatively we could expose the cookie to the client so we can wipe it client side instead
			alert('Unable to logout while offline');
			ev.preventDefault();
		}
	}
</script>

{#if $userQuery.isLoading}
	<Loading class="size-5" />
{:else if $userQuery.data}
	{@const initials = $userQuery.data.username.toUpperCase().slice(0, 2)}

	<div class="flex flex-row items-center gap-2">
		<a
			data-sveltekit-preload-data="false"
			class="px-5 py-2 rounded-md shadow bg-black text-white"
			onclick={handleLogout}
			href="/api/users/logout">Logout</a
		>

		<div
			class="bg-neutral-200 flex flex-row gap-2 items-center pl-5 pr-2 py-1 shadow border border-neutral-300 rounded-lg"
		>
			<span class="text-ellipsis">{$userQuery.data.username}</span>
			<div
				class="overflow-hidden size-8 rounded-full bg-blue-600 text-white font-bold text-base font-mono flex flex-row items-center justify-center shadow border"
			>
				{initials}
			</div>
		</div>
	</div>
{/if}
