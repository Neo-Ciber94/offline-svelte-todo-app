<script lang="ts">
	import { page } from '$app/stores';

	const todoId = $derived($page.params.todo_id);
</script>

<div class="w-full h-full flex flex-row justify-center items-center">
	<h4 class="font-bold text-2xl text-neutral-600">Todo {todoId}</h4>
</div>
