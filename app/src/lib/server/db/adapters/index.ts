/**
 * Base database adapter.
 */
export abstract class SqliteDatabaseAdapter {
	/**
	 * Run the specified query and get the first result if any.
	 * @param sql The sql to execute.
	 * @param params Optional parameters to bind to the query.
	 */
	abstract first<T extends Record<string, unknown>>(
		sql: string,
		params?: Record<string, unknown>
	): Promise<T | undefined>;

	/**
	 * Run the specified query and get all the results in an array.
	 * @param sql The sql to execute.
	 * @param params Optional parameters to bind to the query.
	 */
	abstract all<T extends Record<string, unknown>>(
		sql: string,
		params?: Record<string, unknown>
	): Promise<T[]>;

	/**
	 * Run the specified query and ignore the result.
	 * @param sql The sql to execute.
	 * @param params Optional parameters to bind to the query.
	 */
	abstract run(sql: string, params?: Record<string, unknown>): Promise<void>;
}
