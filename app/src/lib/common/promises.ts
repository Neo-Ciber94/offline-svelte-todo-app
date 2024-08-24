/* eslint-disable @typescript-eslint/no-unused-vars */
interface PromiseWithResolvers<T> {
	promise: Promise<T>;
	resolve: (value: T) => void;
	reject: (err: unknown) => void;
}

export function promiseWithResolvers<T>(): PromiseWithResolvers<T> {
	let resolve = (value: T) => {};
	let reject = (err: unknown) => {};

	const promise = new Promise<T>((resolveFunction, rejectFunction) => {
		resolve = resolveFunction;
		reject = rejectFunction;
	});

	return { resolve, reject, promise };
}
