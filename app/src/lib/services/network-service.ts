export class ConnectivityService {
	isOnline(): boolean {
		return navigator.onLine;
	}
}
