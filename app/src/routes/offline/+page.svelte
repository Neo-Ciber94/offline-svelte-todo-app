<script lang="ts">
	function reloadPage() {
		if (location.pathname === '/offline') {
			location.href = location.origin;
		} else {
			location.reload();
		}
	}

	$effect(() => {
		window.addEventListener('online', reloadPage);
		return () => {
			window.removeEventListener('online', reloadPage);
		};
	});

	$effect(() => {
		async function checkIsOnline() {
			try {
				await fetch('/', { method: 'HEAD' });
				return true;
			} catch {
				return false;
			}
		}

		const intervalId = setInterval(async () => {
			const isOnline = await checkIsOnline();

			if (isOnline) {
				reloadPage();
			}
		}, 5000);

		return () => {
			clearInterval(intervalId);
		};
	});
</script>

{#snippet OfflineIcon()}
	<svg xmlns="http://www.w3.org/2000/svg" width={'40px'} height={'40px'} viewBox="0 0 16 16">
		<path
			fill="currentColor"
			d="m6.517 12.271l1.254-1.254Q7.883 11 8 11a1.5 1.5 0 1 1-1.483 1.271m2.945-2.944l.74-.74c.361.208.694.467.987.772a.5.5 0 0 1-.721.693a3.4 3.4 0 0 0-1.006-.725m2.162-2.163l.716-.715q.463.349.87.772a.5.5 0 1 1-.722.692a6.3 6.3 0 0 0-.864-.749M7.061 6.07A6.2 6.2 0 0 0 3.54 7.885a.5.5 0 0 1-.717-.697a7.2 7.2 0 0 1 5.309-2.187zm6.672-1.014l.71-.71q.411.346.786.736a.5.5 0 0 1-.721.692a9 9 0 0 0-.775-.718m-3.807-1.85A9 9 0 0 0 8 3a9 9 0 0 0-6.469 2.734a.5.5 0 1 1-.717-.697A10 10 0 0 1 8 2c.944 0 1.868.131 2.75.382zM8 13a.5.5 0 1 0 0-1a.5.5 0 0 0 0 1m-5.424 1a.5.5 0 0 1-.707-.707L14.146 1.146a.5.5 0 0 1 .708.708z"
		/>
	</svg>
{/snippet}

<svelte:head>
	<title>TodoApp | Offline</title>
</svelte:head>

<div class="w-full h-[85vh] flex flex-col items-center justify-center">
	<div class="flex flex-row gap-3 font-bold text-green-500 text-2xl items-center">
		{@render OfflineIcon()}
		<span>You are offline</span>
	</div>
</div>
