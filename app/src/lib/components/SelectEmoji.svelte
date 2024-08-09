<script lang="ts">
	import { EMOJIS } from '$lib/common/emojis';

	type Props = {
		emoji: string;
		name?: string;
	};

	let { emoji = $bindable(), name }: Props = $props();
</script>

<select {name} bind:value={emoji} class="border px-2 py-1 rounded-md shadow">
	{#each EMOJIS as emoji}
		<option value={emoji.value} class="flex flex-row gap-2 items-center">
			{emoji.value}{' '}{emoji.name}
		</option>
	{/each}
</select>
