<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Loading from '$lib/components/Loading.svelte';
	import { inject } from '$lib/client/di';
	import { TodoService } from '$lib/services/todo.service';
	import { scale } from 'svelte/transition';
	import * as easing from 'svelte/easing';
	import type { PageData } from './$types';
	import { invalidateAll } from '$app/navigation';

	const { data }: { data: PageData } = $props();
	const todo = $derived(data.todo);

	const todoService = inject(TodoService);
	const todoId = $derived($page.params.todo_id);
	let isMutating = $state(false);

	async function completeTodo() {
		await todoService.update({
			id: todoId,
			done: true
		});

		await invalidateAll();
	}

	async function deleteTodo() {
		if (!confirm(`Delete "${todo.title}"?`)) {
			return;
		}

		isMutating = true;

		try {
			await todoService.delete(todoId);
			await goto('/todos', { invalidateAll: true });
		} finally {
			isMutating = false;
		}
	}
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
	{#if todo == null}
		<Loading class="size-10" />
	{:else}
		{#key todoId}
			<div
				in:scale={{ duration: 1000, opacity: 0, start: 0.7, easing: easing.quintOut }}
				class="flex flex-col w-[95vw] sm:w-[500px] rounded-xl border shadow overflow-hidden bg-white"
			>
				<div
					class="bg-black text-white py-4 px-1 text-xl flex flex-row items-center justify-between"
				>
					<span class="pl-4">
						{todo.title}
					</span>
					<div class="flex flex-row text-sm">
						<button
							disabled={isMutating}
							class="font-semibold text-red-400 disabled:opacity-70 disabled:cursor-not-allowed min-w-16 text-center"
							onclick={deleteTodo}
						>
							Delete
						</button>
						<a
							data-disabled={isMutating}
							class="font-semibold text-orange-400 data-[disabled=true]:cursor-not-allowed min-w-16 text-center"
							href={`/todos/${todo.id}/edit`}
						>
							Edit
						</a>
					</div>
				</div>
				<div class="p-4">
					{#if todo.description}
						<p>
							{todo?.description}
						</p>
					{:else}
						<p class="text-neutral-400 italic">No description</p>
					{/if}

					<div class="mt-4 w-fit">
						{@render Done(todo.done)}
					</div>
				</div>
				{#if !todo.done}
					<button
						disabled={isMutating}
						onclick={completeTodo}
						class="p-2 bg-neutral-800 hover:bg-neutral-950 text-white rounded-xl shadow text-center mx-2 mb-2 disabled:opacity-70 disabled:cursor-not-allowed"
					>
						<span> Mark as Complete</span>
					</button>
				{/if}
			</div>
		{/key}
	{/if}
</div>
