<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="w-full h-screen flex flex-row items-center justify-center">
	<h1 class="text-red-500 font-bold text-xl">
		<span>{$page.status}</span>
		<span class="opacity-70">|</span>
		<span>{$page.error?.message ?? 'Something went wrong'}</span>
	</h1>
</div>
