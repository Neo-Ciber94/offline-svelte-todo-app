<script lang="ts">
	import { goto } from '$app/navigation';
	import { ApplicationError } from '$lib/common/error';
	import ErrorAlert from '$lib/components/ErrorAlert.svelte';
	import { inject } from '$lib/client/di';
	import { TodoService } from '$lib/services/todo.service';
	import SelectEmoji from '$lib/components/SelectEmoji.svelte';
	import type { PageData } from './$types';

	const { data }: { data: PageData } = $props();
	const todoService = inject(TodoService);
	const todoId = $derived(data.todo.id);

	let title = $state(data.todo.title);
	let description = $state(data.todo.description);
	let isDone = $state(data.todo.done);
	let emoji = $state(data.todo.emoji);

	// ui state
	let isMutating = $state(false);
	let error = $state<string>();

	async function handleEdit(ev: SubmitEvent) {
		ev.preventDefault();
		error = undefined;
		isMutating = true;

		try {
			await todoService.update({
				id: todoId,
				title,
				emoji,
				description,
				done: isDone
			});

			await goto(`/todos/${todoId}`, { invalidateAll: true });
		} catch (err) {
			error = err instanceof ApplicationError ? err.message : 'Failed to update todo';
		} finally {
			isMutating = false;
		}
	}
</script>

<div class="w-full h-[75vh] flex flex-col justify-center items-center">
	<form
		onsubmit={handleEdit}
		class="w-[95vw] sm:w-[500px] flex flex-col gap-2 shadow border p-4 rounded-md"
	>
		<h2 class="font-bold text-2xl">Edit Todo</h2>
		<input
			disabled={isMutating}
			bind:value={title}
			name="username"
			class="border px-2 py-1 rounded-md shadow"
			placeholder="Title"
			required
		/>
		<SelectEmoji bind:emoji />
		<textarea
			disabled={isMutating}
			bind:value={description}
			name="description"
			class="border px-2 py-1 rounded-md shadow"
			placeholder="Description"
			rows={5}
		></textarea>

		<label class="flex flex-row items-center gap-2 my-2 ml-1">
			<input type="checkbox" name="done" class="accent-neutral-700 size-5" bind:checked={isDone} />
			<span>Done</span>
		</label>

		<button
			disabled={isMutating}
			class="bg-black text-white p-2 rounded-md disabled:opacity-70 disabled:cursor-not-allowed"
		>
			Update
		</button>

		{#if error}
			<ErrorAlert {error} />
		{/if}
	</form>
</div>
