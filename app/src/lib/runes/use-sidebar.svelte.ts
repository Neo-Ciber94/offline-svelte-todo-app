declare global {
	// eslint-disable-next-line no-var
	var SIDEBAR_OPEN: boolean | boolean;
}

let isSidebarOpen = $state(Boolean(globalThis.SIDEBAR_OPEN));

export function useSidebar() {
	return {
		get isOpen() {
			return isSidebarOpen;
		},
		set isOpen(value: boolean) {
			isSidebarOpen = value;
			localStorage.setItem('sidebarOpen', value.toString());
		}
	};
}
