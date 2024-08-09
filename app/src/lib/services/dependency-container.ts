/* eslint-disable @typescript-eslint/no-unsafe-function-type */

interface AbstractType<T> extends Function {
	prototype: T;
}

interface DefaultType<T> extends Function {
	new (): T;
}

type Type<T> = DefaultType<T> | AbstractType<T>;

type DependencyProvider<T> = () => T;

type RegisterOptions<T> = {
	as: Type<T>;
};

export class DependencyContainer {
	#deps = new Map<unknown, DependencyProvider<unknown>>();

	register<T, U extends T>(type: Type<T>, options?: RegisterOptions<U>) {
		const f = options?.as ?? type;

		if (f.constructor === null) {
			throw new Error(`Type '${f.name}' cannot be instantiated`);
		}

		this.#deps.set(type, () => {
			// @ts-expect-error We already check the type can be instantiated
			return new f();
		});
	}

	inject<T>(type: Type<T>) {
		const provider = this.#deps.get(type);

		if (!provider) {
			throw new Error(`Unable to resolve dependency: '${type.name}'`);
		}

		return provider() as T;
	}
}

