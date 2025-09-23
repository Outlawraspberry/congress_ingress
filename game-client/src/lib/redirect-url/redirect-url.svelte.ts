export function getRedirectUrl({
	currentUrl,
	fallbackPath = '/',
	allowedRedirectUrl
}: {
	currentUrl: URL;
	fallbackPath?: string;
	allowedRedirectUrl: URL;
}): URL {
	const redirectTo = currentUrl.searchParams.get('redirectTo');

	if (!redirectTo) {
		return new URL(fallbackPath, currentUrl);
	}

	let redirectUrl: URL;
	try {
		redirectUrl = new URL(redirectTo);
	} catch {
		// Not a valid absolute URL
		return new URL(fallbackPath, currentUrl);
	}

	// Only allow if host matches allowedRedirectUrl.host
	if (redirectUrl.host !== allowedRedirectUrl.host) {
		return new URL(fallbackPath, currentUrl);
	}

	return redirectUrl;
}
