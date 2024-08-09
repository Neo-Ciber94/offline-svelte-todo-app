<script>
	import { useSidebar } from '$lib/runes/use-sidebar.svelte';
	import UserAvatar from './UserAvatar.svelte';

	const sidebar = useSidebar();
</script>

<header
	class="h-16 shadow-md w-full flex flex-row px-4 items-center justify-between border border-neutral-300 relative"
>
	<button class="text-neutral-600 lg:hidden block" onclick={() => (sidebar.isOpen = true)}>
		<svg xmlns="http://www.w3.org/2000/svg" class="size-10" viewBox="0 0 24 24"
			><path fill="currentColor" d="M3 4h18v2H3zm0 7h18v2H3zm0 7h18v2H3z" /></svg
		>
	</button>

	<a href="/todos" class="font-bold text-xl text-green-500 flex flex-row items-center gap-1">
		<img src="/todo-app.png" alt="logo" class="size-7" />
		<span> TodoApp </span>
	</a>
	<UserAvatar />
</header>
