export abstract class NetworkService {
	abstract isOnline(): boolean;
}

class BrowserCheckNetwork extends NetworkService {
	isOnline(): boolean {
		return navigator.onLine;
	}
}

export const networkService = new BrowserCheckNetwork();
