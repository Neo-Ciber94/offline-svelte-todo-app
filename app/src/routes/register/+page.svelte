<script lang="ts">
	import { goto } from '$app/navigation';
	import { userService } from '$lib/services/user.service';

	let username = $state('');
	let error = $state<string>();

	async function handleRegister(ev: SubmitEvent) {
		ev.preventDefault();
		error = undefined;

		const result = await userService.register(username);

		if (result.success) {
			await goto('/todos');
			return;
		}

		error = result.error;
	}
</script>

<div class="w-full h-[75vh] flex flex-col justify-center items-center">
	<form
		onsubmit={handleRegister}
		class="w-[95vw] sm:w-[500px] flex flex-col gap-2 shadow border p-4 rounded-md"
	>
		<h2 class="font-bold text-2xl">Create Account</h2>
		<input
			bind:value={username}
			name="username"
			class="border px-2 py-1 rounded-md shadow"
			placeholder="Username"
			required
		/>
		<button class="bg-black text-white p-2 rounded-md">Register</button>
		<p class="text-sm text-neutral-500">
			Have an account? <a href="/login" class="text-blue-600">Login instead</a>
		</p>

		{#if error}
			<p class="text-sm font-bold p-4 bg-red-200/90 text-red-700 rounded-md">
				{error}
			</p>
		{/if}
	</form>
</div>
