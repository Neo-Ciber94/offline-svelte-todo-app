let ONLINE = $state(false);

$effect.root(() => {
	ONLINE = navigator.onLine;

	const handleOnline = () => (ONLINE = true);
	const handleOffline = () => (ONLINE = false);

	window.addEventListener('online', handleOnline);
	window.addEventListener('offline', handleOffline);

	return () => {
		window.removeEventListener('online', handleOnline);
		window.removeEventListener('offline', handleOffline);
	};
});

export function useIsOnline() {
	return {
		get isOnline() {
			return ONLINE;
		}
	};
}
