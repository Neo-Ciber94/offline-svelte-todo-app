type ReleaseLock = () => void;

export class Mutex {
	#lock: Promise<void> = Promise.resolve();

	async lock(): Promise<ReleaseLock> {
		let release: ReleaseLock = () => {};
		const newLock = new Promise<void>((r) => (release = r));

		// Wait until is unlocked
		const currentLock = this.#lock;
		await currentLock;

		// Set the new lock
		this.#lock = currentLock.then(() => newLock);

		return release;
	}
}
