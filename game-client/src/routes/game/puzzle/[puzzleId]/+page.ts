import { page } from '$app/state';
import { supabase } from '$lib/supabase/db.svelte';
import type { Puzzle } from '../../../../types/alias';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, url }) => {
	const puzzleParameter = url.searchParams.get('puzzle');
	const pointId = url.searchParams.get('pointId');
	const type = url.searchParams.get('type');

	if (pointId == null) {
		throw new Error('pointId parameter is mandatory, but not provided.');
	}

	if (type == null) {
		throw new Error('type parameter is mandatory, but not provided.');
	}

	let puzzle: Puzzle['Row'];

	if (puzzleParameter) {
		puzzle = JSON.parse(puzzleParameter);
	} else {
		const puzzleResult = await supabase
			.from('puzzle')
			.select('*')
			.filter('id', 'eq', params.puzzleId);

		if (puzzleResult.error) throw puzzleResult.error;

		if (puzzleResult.data.length === 0) throw new Error(`puzzle "${params.puzzleId}" not found!`);

		puzzle = puzzleResult.data[0];
	}

	return { puzzle, pointId, type };
};
