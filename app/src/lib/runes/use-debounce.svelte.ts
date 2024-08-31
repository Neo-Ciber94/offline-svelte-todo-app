export function useDebounce<T>(ms: number, f: () => T) {
	let value = $state(f());

	$effect(() => {
		const newValue = f();

		const timeoutId = window.setTimeout(() => {
			value = newValue;
			console.log("Set value")
		}, ms);

		return () => {
			console.log("Clean")
			clearTimeout(timeoutId);
		};
	});

	return {
		get current() {
			return value;
		}
	};
}
