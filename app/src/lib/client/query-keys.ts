export const queryKeys = {
	todos: {
		all: () => ['todos'],
		one: (id: string) => ['todos', id]
	},
	users: {
		me: () => ['users', 'me']
	}
} as const;
