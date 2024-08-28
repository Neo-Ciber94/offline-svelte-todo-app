export const queryKeys = {
	todos: {
		all: (...params: string[]) => ['todos', ...params],
		one: (id: string) => ['todos', id]
	},
	users: {
		me: () => ['users', 'me']
	}
} as const;
