let IS_ONLINE = $state(true);

$effect.root(() => {
	IS_ONLINE = navigator.onLine;

	const handleOnline = () => (IS_ONLINE = true);
	const handleOffline = () => (IS_ONLINE = false);

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
			return IS_ONLINE;
		}
	};
}
