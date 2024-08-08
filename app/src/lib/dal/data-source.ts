export type EmptyQuery = Record<string, never>;

export abstract class DataSource<T, TQuery = EmptyQuery, TAdd = T, TUpdate = Partial<T>> {
	abstract getAll(query: TQuery): Promise<T[]>;
	abstract getByKey(key: string): Promise<T | undefined>;
	abstract add(input: TAdd): Promise<T>;
	abstract update(input: TUpdate): Promise<T | undefined>;
	abstract delete(key: string): Promise<void>;
}
