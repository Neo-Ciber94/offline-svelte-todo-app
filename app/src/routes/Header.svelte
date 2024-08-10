<script>
	import { useSidebar } from '$lib/runes/use-sidebar.svelte';
	import UserAvatar from './UserAvatar.svelte';

	const sidebar = useSidebar();
</script>

<header
	class="h-[var(--header-height)] shadow shadow-green-500/40 w-full flex flex-row px-2 sm:px-4 items-center justify-between relative bg-black text-white"
>
	<button class="text-white lg:hidden block" onclick={() => (sidebar.isOpen = true)}>
		<svg xmlns="http://www.w3.org/2000/svg" class="size-8 sm:size-10" viewBox="0 0 24 24"
			><path fill="currentColor" d="M3 4h18v2H3zm0 7h18v2H3zm0 7h18v2H3z" />
		</svg>
	</button>

	<a
		href="/"
		class="font-bold text-base sm:text-xl text-green-500 flex flex-row items-center gap-1"
	>
		<img src="/todo-app.png" alt="logo" class="size-5 sm:size-7" />
		<span> TodoApp </span>
	</a>
	<UserAvatar />
</header>
