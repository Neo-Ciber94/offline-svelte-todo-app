declare const SIDEBAR_OPEN: boolean | undefined;

let isSidebarOpen = $state(typeof SIDEBAR_OPEN === 'undefined' ? true : SIDEBAR_OPEN);

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
