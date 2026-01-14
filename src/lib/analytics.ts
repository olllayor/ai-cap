declare global {
	interface Window {
		umami?: {
			track: (eventName: string, data?: Record<string, any>) => void;
		};
	}
}

// Initialize Umami dynamically to avoid COEP/COOP conflicts
export const initUmami = () => {
	const umamiId = import.meta.env.VITE_UMAMI_WEBSITE_ID;
	if (umamiId && typeof window !== 'undefined' && !window.umami) {
		try {
			// Create and inject the script dynamically after page load
			const script = document.createElement('script');
			script.defer = true;
			script.src = 'https://cloud.umami.is/script.js';
			script.setAttribute('data-website-id', umamiId);

			// Add to head to ensure it loads before other scripts
			document.head.appendChild(script);

			console.log('Umami analytics initialized with ID');
		} catch (error) {
			console.warn('Failed to initialize Umami analytics:', error);
		}
	}
};

export const trackEvent = (eventName: string, data?: Record<string, any>) => {
	if (typeof window !== 'undefined' && window.umami) {
		try {
			window.umami.track(eventName, data);
		} catch (error) {
			console.warn('Umami tracking failed:', error);
		}
	} else {
		// Queue events if Umami hasn't loaded yet
		console.log('Umami not ready, event queued:', eventName, data);
	}
};
