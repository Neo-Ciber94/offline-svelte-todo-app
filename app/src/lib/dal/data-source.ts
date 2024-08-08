export abstract class DataSource<T, TAdd = T, TUpdate = Partial<T>> {
	abstract getAll(): Promise<T[]>;
	abstract getByKey(key: string): Promise<T | undefined>;
	abstract add(input: TAdd): Promise<T>;
	abstract update(input: TUpdate): Promise<T | undefined>;
	abstract delete(key: string): Promise<void>;
}
