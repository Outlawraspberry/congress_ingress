import { describe, it, expect } from 'vitest';
import { getRedirectUrl } from './redirect-url.svelte';

describe('getRedirectUrl', () => {
	const allowedHost = 'example.com';
	const allowedRedirectUrl = new URL(`https://${allowedHost}`);

	it('returns fallback when redirectTo param is missing', () => {
		const currentUrl = new URL('https://example.com');
		const result = getRedirectUrl({
			currentUrl,
			fallbackPath: '/',
			allowedRedirectUrl
		});
		expect(result.toString()).toBe('https://example.com/');
	});

	it('returns fallback when redirectTo is not an absolute URL', () => {
		const currentUrl = new URL('https://example.com/?redirectTo=/dashboard');
		const result = getRedirectUrl({
			currentUrl,
			fallbackPath: '/',
			allowedRedirectUrl
		});
		expect(result.toString()).toBe('https://example.com/');
	});

	it('returns fallback when host does not match', () => {
		const currentUrl = new URL('https://example.com/?redirectTo=https://other.com/profile');
		const result = getRedirectUrl({
			currentUrl,
			fallbackPath: '/',
			allowedRedirectUrl
		});
		expect(result.toString()).toBe('https://example.com/');
	});

	it('returns redirect URL for valid absolute URL and host match', () => {
		const currentUrl = new URL('https://example.com/?redirectTo=https://example.com/profile');
		const result = getRedirectUrl({
			currentUrl,
			fallbackPath: '/',
			allowedRedirectUrl
		});
		expect(result.toString()).toBe('https://example.com/profile');
	});

	it('returns custom fallback path', () => {
		const currentUrl = new URL('https://example.com');
		const result = getRedirectUrl({
			currentUrl,
			fallbackPath: '/custom',
			allowedRedirectUrl
		});
		expect(result.toString()).toBe('https://example.com/custom');
	});
});
