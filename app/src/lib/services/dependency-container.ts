/* eslint-disable @typescript-eslint/no-unsafe-function-type */

interface Type<T> extends Function {
	new (): T;
}

interface Provider<T> {
	get(): T;
}

/**
 * A dependency injection token.
 */
export class InjectionToken<T> {
	private constructor(readonly name: string) {}

	/**
	 * Creates a `InjectionToken` with a singleton provider.
	 * @param name The name of the token.
	 * @param f The function.
	 */
	static fromSingleton<T>(name: string, f: () => T) {
		const token = new InjectionToken<T>(name);
		const provider = singleton(f);
		return { token, provider };
	}
}

type Token<T> = Type<T> | InjectionToken<T>;

/**
 * A dependency container.
 */
export class DependencyContainer {
	#deps = new Map<unknown, Provider<unknown>>();

	/**
	 * Register a dependency from a type.
	 */
	register<T>(type: Type<T>) {
		if (type.constructor === null) {
			throw new Error(`Type '${type.name}' cannot be instantiated`);
		}

		this.registerWith(
			type,
			singleton(() => new type())
		);
	}

	/**
	 * Register a dependency with a token.
	 * @param token The injection token.
	 * @param provider The provider for the dependency.
	 */
	registerWith<T>(token: Token<T>, provider: Provider<T>) {
		this.#deps.set(token, provider);
	}

	/**
	 * Retrieve a dependency with the given token.
	 * @param token The token for retrieve the dependency.
	 * @throws If the dependency is not found.
	 */
	inject<T>(token: Token<T>) {
		const provider = this.#deps.get(token);

		if (!provider) {
			throw new Error(`Unable to resolve dependency: '${token.name}'`);
		}

		return provider.get() as T;
	}
}

/**
 * Creates a singleton provider.
 * @param f The function that provides the value.
 */
export function singleton<T>(f: () => T): Provider<T> {
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
