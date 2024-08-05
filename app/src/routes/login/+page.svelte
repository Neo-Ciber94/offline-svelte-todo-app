<script lang="ts">
	let username = $state('');

	async function handleLogin() {}
</script>

<div class="w-full h-[75vh] flex flex-col justify-center items-center">
	<form
		onsubmit={handleLogin}
		class="w-[95vw] sm:w-[500px] flex flex-col gap-2 shadow border p-4 rounded-md"
	>
		<h2 class="font-bold text-2xl">Login</h2>
		<input
			bind:value={username}
			name="username"
			class="border px-2 py-1 rounded-md shadow"
			placeholder="Username"
		/>
		<button class="bg-black text-white p-2 rounded-md">Login</button>
		<p class="text-sm text-neutral-500">
			Do not have an account? <a href="/register" class="text-blue-600">Register here</a>
		</p>
	</form>
</div>
