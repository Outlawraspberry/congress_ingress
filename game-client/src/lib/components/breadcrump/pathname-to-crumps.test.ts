import { describe, expect, test } from 'vitest';
import { pathnameToCrumps } from './pathname-to-crumps';

describe('PathnameToCrumps works when', () => {
	test.each([
		{
			pathname: '/',
			result: [{ name: '/', href: '/' }]
		},
		{
			pathname: '/path/',
			result: [
				{ name: '/', href: '/' },
				{ name: 'path', href: '/path' }
			]
		},
		{
			pathname: '/path/name',
			result: [
				{ name: '/', href: '/' },
				{ name: 'path', href: '/path' },
				{ name: 'name', href: '/path/name' }
			]
		},
		{
			pathname: '/path/name/more',
			result: [
				{ name: '/', href: '/' },
				{ name: 'path', href: '/path' },
				{ name: 'name', href: '/path/name' },
				{ name: 'more', href: '/path/name/more' }
			]
		}
	])('nested pathname into crumps %j', (value) => {
		expect(pathnameToCrumps(value.pathname)).toStrictEqual(value.result);
	});
});
