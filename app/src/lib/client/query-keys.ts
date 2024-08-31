export const queryKeys = {
	todos: {
		all: (...params: unknown[]) => ['todos', ...params],
		one: (id: string) => ['todos', id]
	},
	users: {
		me: () => ['users', 'me']
	}
} as const;
