<script>
	import UserAvatar from './UserAvatar.svelte';
</script>

<header
	class="h-16 shadow-md w-full flex flex-row px-4 items-center justify-between border border-neutral-300 relative"
>
	<a href="/todos" class="font-bold text-xl text-green-500 flex flex-row items-center gap-1">
		<img src="/icons/todoapp.png" alt="logo" class="size-7" />
		<span> TodoApp </span>
	</a>
	<UserAvatar />
</header>
