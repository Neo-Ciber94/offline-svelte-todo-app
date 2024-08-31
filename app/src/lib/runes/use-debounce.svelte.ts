export function useDebounce<T>(ms: number, f: () => T) {
	let value = $state(f());

	$effect(() => {
		const newValue = f();

		const timeoutId = window.setTimeout(() => {
			value = newValue;
		}, ms);

		return () => {
			clearTimeout(timeoutId);
		};
	});

	return {
		get current() {
			return value;
		}
	};
}
