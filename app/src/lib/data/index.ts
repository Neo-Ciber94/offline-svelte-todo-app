export type User = {
	id: string;
	username: string;
	createdAt: Date;
};

export type Todo = {
	id: string;
	userId: string;
	title: string;
	description: string | null;
	done: boolean;
	createdAt: Date;
};
