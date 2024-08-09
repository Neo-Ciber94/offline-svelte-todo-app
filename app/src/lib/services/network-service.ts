export abstract class NetworkServiceInterface {
	abstract isOnline(): boolean;
}

export class NetworkService extends NetworkServiceInterface {
	isOnline(): boolean {
		return navigator.onLine;
	}
}
