<script lang="ts">
	const { error }: { error: string } = $props();
</script>

<p class="text-sm font-bold p-4 bg-red-200/90 text-red-700 rounded-md">
	{error}
</p>
