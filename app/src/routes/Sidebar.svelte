<script lang="ts">
	import { useMediaQuery } from '$lib/runes/use-media-query.svelte';
	import { useSidebar } from '$lib/runes/use-sidebar.svelte';
	import TodoList from './todos/TodoList.svelte';

	const sidebar = useSidebar();
	const isLargeScreen = useMediaQuery('(min-width: 1024px)');

	$effect(() => {
		if (isLargeScreen.matching) {
			sidebar.isOpen = true;
		}
	});
</script>

<aside
	data-open={sidebar.isOpen}
	class={`fixed top-0 left-0 h-full lg:relative shrink-0 sm:w-[400px] w-full border-r border-neutral-200 bg-black shadow z-10 lg:z-auto
data-[open=false]:-translate-x-full data-[open=true]:translate-x-0 transition-all duration-500`}
>
	<a
		href="/todos"
		class="font-bold text-2xl text-green-500 mt-5 pb-2 lg:hidden flex flex-row gap-2 w-full justify-center items-center"
	>
		<img src="/todo-app.png" alt="logo" class="size-7" />
		<span>TodoApp</span>
	</a>

	<button
		class="text-green-300 absolute top-2 right-2 lg:hidden block"
		onclick={() => {
			sidebar.isOpen = false;
		}}
	>
		<svg xmlns="http://www.w3.org/2000/svg" class="size-10" viewBox="0 0 24 24"
			><path
				fill="currentColor"
				d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6z"
			/>
		</svg>
	</button>

	<div class="h-full overflow-y-auto">
		<TodoList />
	</div>
</aside>
