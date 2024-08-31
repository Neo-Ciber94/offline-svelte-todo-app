import type { z, ZodObject } from 'zod';
import { page } from '$app/stores';
import { storeToRune } from './runes.svelte';
import { goto } from '$app/navigation';

type UseQueryParamsArgs<S extends ZodObject<any>> = {
	defaultValue?: z.infer<S>;
};

type UseQueryParams<T> = {
	value: T;
	set: (newValue: Partial<T>) => void;
	update: (updater: (prevValue: T) => T) => void;
};

export function useQueryParams<S extends ZodObject<any>>(
	schema: S,
	args: UseQueryParamsArgs<S> & { defaultValue: z.infer<S> }
): UseQueryParams<z.infer<S>>;

export function useQueryParams<S extends ZodObject<any>>(
	schema: S,
	args: UseQueryParamsArgs<S> & { defaultValue?: undefined }
): UseQueryParams<z.infer<S> | undefined>;

export function useQueryParams<S extends ZodObject<any>>(
	schema: S,
	args?: UseQueryParamsArgs<S>
): UseQueryParams<z.infer<S>> {
	const { defaultValue } = args || {};
	let currentValue = $state<z.infer<S>>(defaultValue!);

	const searchParams = storeToRune(page, ($x) => $x.url.searchParams);

	$effect.pre(() => {
		const obj = Object.fromEntries(searchParams.value);

		const result = schema.safeParse(obj);
		const newValue = result.success ? result.data : defaultValue;
		currentValue = newValue!;
	});

	function setValue(newValue: Partial<z.infer<S>>) {
		currentValue = { ...currentValue, ...newValue };
		const sp = toSearchParams(newValue).toString();
		goto(`?${sp}`, { replaceState: true });
	}

	return {
		get value() {
			return currentValue;
		},

		set value(newValue: z.infer<S>) {
			setValue(newValue);
		},

		set(newValue: Partial<z.infer<S>>) {
			setValue(newValue);
		},

		update(updater: (prevValue: z.infer<S>) => z.infer<S>) {
			const newValue = updater(currentValue!);
			setValue(newValue);
		}
	};
}

function toSearchParams(obj: Record<string, unknown>) {
	const searchParams = new URLSearchParams();

	for (const [key, value] of Object.entries(obj)) {
		if (value != null && value !== '') {
			searchParams.set(key, value?.toString());
		}
	}

	return searchParams;
}
