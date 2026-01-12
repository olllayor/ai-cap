declare global {
	interface Window {
		umami?: {
			track: (eventName: string, data?: Record<string, any>) => void;
		};
	}
}

export const trackEvent = (eventName: string, data?: Record<string, any>) => {
	if (typeof window !== 'undefined' && window.umami) {
		try {
			window.umami.track(eventName, data);
		} catch (error) {
			console.warn('Umami tracking failed:', error);
		}
	}
};
