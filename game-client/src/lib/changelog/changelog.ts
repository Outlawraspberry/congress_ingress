export interface ChangeSet {
	timestamp: number;
	lineContent: string[];
}
export const changes: ChangeSet[] = [
	{
		timestamp: 1767083923135,
		lineContent: ['Added a small survey']
	},
	{
		timestamp: 1766906968575,
		lineContent: [
			'Introduced changelog ^^',
			'Added new points, which will be placed during the day'
		]
	}
];
