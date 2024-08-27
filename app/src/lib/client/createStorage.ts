import type { z, ZodType } from 'zod';
import * as devalue from 'devalue';

type CreateStorageOptions<S> = {
	schema: S;
	storage?: Storage;
};

function getDefaultStorage() {
	if (typeof window === 'undefined') {
		return {} as Storage;
	}

	return localStorage;
}

export function createStorage<S extends ZodType>(key: string, options: CreateStorageOptions<S>) {
	const { schema, storage = getDefaultStorage() } = options;

	function setItem(value: z.infer<S>) {
		const json = devalue.stringify(value);
		storage.setItem(key, json);
	}

	function getItem(): z.infer<S> | null {
		const raw = storage.getItem(key);

		if (!raw) {
			return null;
		}

		try {
			const json = devalue.parse(raw);
			const result = schema.safeParse(json);
			return result.success ? result.data : null;
		} catch (err) {
			console.error(err);
			return null;
		}
	}

	function removeItem() {
		storage.removeItem(key);
	}

	return { setItem, getItem, removeItem };
}
