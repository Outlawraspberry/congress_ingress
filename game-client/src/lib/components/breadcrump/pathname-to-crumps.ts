export interface Crump {
	name: string;
	href: string;
}

export function pathnameToCrumps(pathname: string): Crump[] {
	const crumps: Crump[] = [{ name: '/', href: '/' }];
	const segments = pathname
		.replace(/^\/|\/$/g, '')
		.split('/')
		.filter(Boolean);
	let currentPath = '';
	for (const segment of segments) {
		currentPath += '/' + segment;
		crumps.push({ name: segment, href: currentPath });
	}
	return crumps;
}
