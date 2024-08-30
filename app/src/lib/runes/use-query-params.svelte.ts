import { derived, type Readable } from 'svelte/store';
import type { z, ZodType } from 'zod';
import { page } from '$app/stores';
import { storeToRune } from './runes.svelte';

type UseQueryParamsArgs<S extends ZodType> = {
	schema: S;
	defaultValue?: z.infer<S>;
};

type UseQueryParams<T> = {
	value: T;
};

export function useQueryParams<S extends ZodType>(
	args: UseQueryParamsArgs<S>
): UseQueryParams<z.infer<S> | undefined> {
	const { schema, defaultValue } = args;
	let currentValue = $state<z.infer<S>>();

	const url = storeToRune(page, ($x) => $x.url);

	return {
		get value() {
			return currentValue;
		},

		set value(newValue: z.infer<S>) {
			currentValue = newValue;
		}
	};
}
