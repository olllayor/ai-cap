import { useEffect } from 'react';

export function Analytics() {
	useEffect(() => {
		const umamiId = import.meta.env.VITE_UMAMI_WEBSITE_ID;
		const umamiSrc = import.meta.env.VITE_UMAMI_SCRIPT_URL || 'https://cloud.umami.is/script.js';

		if (umamiId && !document.getElementById('umami-script')) {
			const script = document.createElement('script');
			script.id = 'umami-script';
			script.async = true;
			script.defer = true;
			script.src = umamiSrc;
			script.setAttribute('data-website-id', umamiId);
			// For Umami, sometimes you want to track automatically
			// script.setAttribute('data-auto-track', 'true');
			document.head.appendChild(script);
			console.log('[Analytics] Umami initialized');
		}
	}, []);

	return null;
}
