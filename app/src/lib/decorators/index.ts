/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-empty-object-type */
/* eslint-disable @typescript-eslint/no-explicit-any */

export function LogMethodCalls(className: string) {
	return function <T extends { new (...args: any[]): {} }>(constructor: T) {
		return class extends constructor {
			constructor(...args: any[]) {
				super(...args);

				// Iterate through all properties of the class prototype
				for (const propertyName of Object.getOwnPropertyNames(constructor.prototype)) {
					const method = this[propertyName as keyof this];

					// Only wrap methods (ignores constructor and non-function properties)
					if (propertyName !== 'constructor' && typeof method === 'function') {
						// @ts-ignore
						this[propertyName] = (...args: any[]) => {
							console.log(`📝 ${className}.${propertyName} was called`);
							return method.apply(this, args);
						};
					}
				}
			}
		};
	};
}
