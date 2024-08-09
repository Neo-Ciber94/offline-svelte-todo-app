let isSidebarOpen = $state(true);

export function useSidebar() {
	return {
		get isOpen() {
			return isSidebarOpen;
		},
		set isOpen(value: boolean) {
			console.log({ value });
			isSidebarOpen = value;
		}
	};
}
