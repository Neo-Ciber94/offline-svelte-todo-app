export function useMediaQuery(query: string) {
	let match = $state(false);

	$effect.pre(() => {
		const mq = window.matchMedia(query);
		match = mq.matches;

		function handleMatch(ev: MediaQueryListEvent) {
			match = ev.matches;
		}

		mq.addEventListener('change', handleMatch);
		return () => {
			mq.removeEventListener('change', handleMatch);
		};
	});

	return {
		get matching() {
			return match;
		}
	};
}
