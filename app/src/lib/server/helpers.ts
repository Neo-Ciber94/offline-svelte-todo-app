import { stringify } from 'devalue';

export function customJson<T = unknown>(value: T, init?: ResponseInit) {
	const json = stringify(value);
	return new Response(json, {
		headers: {
			'Content-Type': 'application-json',
			...init?.headers
		},
		...init
	});
}
