import { derived, get, readable, type Readable } from 'svelte/store';

const identity = (value: any) => value;

// fromRune, toRune?
export function storeToRune<T, R = T>(store: Readable<T>, selector: (value: T) => R = identity) {
	const derivedStore = derived(store, selector);
	let currentValue = $state(get(derivedStore));

	$effect.pre(() => {
		const unsubscribe = derivedStore.subscribe((value) => {
			currentValue = value;
		});

		return () => {
			unsubscribe();
		};
	});

	return {
		get value() {
			return currentValue;
		},

		set value(newValue: R) {
			currentValue = newValue;
		}
	};
}

export function runeToStore<T>(cb: () => T) {
	return readable(cb(), (set) => {
		$effect(() => {
			set(cb());
		});
	});
}
