export class ApplicationError extends Error {
	constructor(
		readonly status: number,
		message: string
	) {
		super(message);
	}
}
