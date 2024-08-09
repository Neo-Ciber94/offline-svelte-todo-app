let isSidebarOpen = $state(true);

export function useSidebar() {
	return {
		get isOpen() {
			return isSidebarOpen;
		},
		set isOpen(value: boolean) {
			isSidebarOpen = value;
		}
	};
}
