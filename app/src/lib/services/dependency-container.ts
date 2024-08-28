/* eslint-disable @typescript-eslint/no-unsafe-function-type */

interface Type<T> extends Function {
	new (): T;
}

interface Provider<T> {
	get(): T;
}

export class DependencyContainer {
	#deps = new Map<unknown, Provider<unknown>>();

	register<T>(type: Type<T>) {
		if (type.constructor === null) {
			throw new Error(`Type '${type.name}' cannot be instantiated`);
		}

		this.#deps.set(
			type,
			singleton(() => new type())
		);
	}

	inject<T>(type: Type<T>) {
		const provider = this.#deps.get(type);

		if (!provider) {
			throw new Error(`Unable to resolve dependency: '${type.name}'`);
		}

		return provider.get() as T;
	}
}

function singleton<T>(f: () => T): Provider<T> {
	let value: T | undefined;

	return {
		get() {
			if (!value) {
				value = f();
			}

			return value;
		}
	};
}
