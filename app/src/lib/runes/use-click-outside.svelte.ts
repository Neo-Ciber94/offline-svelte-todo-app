export function useClickOutside(ref: () => Element | null | undefined, onclickOutside: () => void) {
	$effect.pre(() => {
		const el = ref();

		function handleClick(ev: MouseEvent) {
			const target = ev.target as Node;

			if (el && !el.contains(target)) {
				onclickOutside();
			}
		}

		window.addEventListener('click', handleClick);
		return () => {
			window.removeEventListener('click', handleClick);
		};
	});
}
