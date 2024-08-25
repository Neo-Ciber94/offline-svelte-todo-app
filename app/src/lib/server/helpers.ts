import { stringify } from 'devalue';

/**
 * Create a JSON response using `devalue` from the given value.
 * @param value The value to convert to json.
 * @param init The response init.
 */
export function toJson<T = unknown>(value: T, init?: ResponseInit) {
	const json = stringify(value);
	return new Response(json, {
		headers: {
			'Content-Type': 'application-json',
			...init?.headers
		},
		...init
	});
}
