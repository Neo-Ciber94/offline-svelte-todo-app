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
		<div
			class="overflow-hidden size-10 rounded-full bg-blue-600 text-white font-bold text-xl font-mono flex flex-row items-center justify-center shadow border"
		>
			{initials}
		</div>
		<span class="text-neutral-500">
			{$userQuery.data.username}
		</span>
	</div>
{/if}
