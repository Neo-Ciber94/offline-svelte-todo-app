export function useDebounce<T>(ms: number, f: () => T) {
	let currentValue = $state(f());

	$effect(() => {
		const newValue = f();

		const timeoutId = window.setTimeout(() => {
			currentValue = newValue;
		}, ms);

		return () => {
			clearTimeout(timeoutId);
		};
	});

	return {
		get value() {
			return currentValue;
		}
	};
}
