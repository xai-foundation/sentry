// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const GAevent = (action: string, category?: string, label?: string, value?: number) => {
	window.gtag('event', action, {
		event_category: category,
		event_label: label,
		value: value,
	})
};