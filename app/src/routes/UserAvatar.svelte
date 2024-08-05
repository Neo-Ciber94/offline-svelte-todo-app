<script lang="ts">
	import Loading from '$lib/components/Loading.svelte';
	import { userRepository } from '$lib/dal/user';
	import { createQuery } from '@tanstack/svelte-query';

	const userQuery = createQuery({
		queryKey: ['user'],
		queryFn() {
			return userRepository.getCurrentUser();
		}
	});
</script>

{#if $userQuery.isLoading}
	<Loading class="size-5" />
{:else if $userQuery.data}
	{@const initials = $userQuery.data.username.toUpperCase().slice(0, 2)}

	<div class="flex flex-row items-center gap-2">
		<a class="px-5 py-2 rounded-md shadow bg-black text-white" href="/api/users/logout">Logout</a>

		<div
			class="bg-neutral-200 flex flex-row gap-2 items-center pl-5 pr-2 py-1 shadow border border-neutral-300 rounded-lg"
		>
			<span>{$userQuery.data.username}</span>
			<div
				class="overflow-hidden size-10 rounded-full bg-blue-600 text-white font-bold text-lg font-mono flex flex-row items-center justify-center shadow border"
			>
				{initials}
			</div>
		</div>
	</div>
{/if}
