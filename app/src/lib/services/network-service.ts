export class NetworkService {
	isOnline(): boolean {
		return navigator.onLine;
	}
}
