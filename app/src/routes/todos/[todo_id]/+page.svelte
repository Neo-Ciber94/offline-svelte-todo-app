<script lang="ts">
	import { page } from '$app/stores';

	const todoId = $derived($page.params.todo_id);
</script>

{#snippet Done(isDone: boolean)}
	<div
		data-done={isDone}
		class="text-sm font-semibold bg-neutral-300 data-[done=true]:bg-green-200 data-[done=true]:text-green-800 px-4 py-2 rounded-2xl shadow"
	>
		{#if isDone}
			<span>Completed</span>
		{:else}
			<span>In Progress</span>
		{/if}
	</div>
{/snippet}

<div class="w-full h-full flex flex-row justify-center items-center">
	<div class="flex flex-col w-[95vw] sm:w-[500px] rounded-xl border shadow overflow-hidden">
		<div class="bg-black text-white p-4 text-xl">Todo {todoId}</div>
		<div class="p-4">
			<p>
				Lorem ipsum dolor sit amet consectetur adipisicing elit. Perspiciatis veritatis fugit
				temporibus accusantium dolorem assumenda facere sequi autem laudantium repudiandae, et nam
				corrupti libero ut, voluptates aperiam harum tempore deserunt.
			</p>

			<div class="mt-4 w-fit">
				{@render Done(Math.random() > 0.5)}
			</div>
		</div>
		<button
			class="p-2 bg-neutral-800 hover:bg-neutral-950 text-white rounded-xl shadow text-center mx-2 mb-2"
		>
			<span> Mark as Complete</span>
		</button>
	</div>
</div>
