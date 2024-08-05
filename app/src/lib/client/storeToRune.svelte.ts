import { readable } from 'svelte/store';

export function storeToRune<T>(cb: () => T) {
	return readable(cb(), (set) => {
		$effect(() => {
			set(cb());
		});
	});
}
