import { NetworkProvider } from './todos.interface';

class BrowserNetworkProvider extends NetworkProvider {
	isOnline(): boolean {
		return navigator.onLine;
	}
}

export const networkProvider = new BrowserNetworkProvider();
