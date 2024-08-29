import { readable } from 'svelte/store';

export function runeToStore<T>(cb: () => T) {
	return readable(cb(), (set) => {
		$effect(() => {
			set(cb());
		});
	});
}
