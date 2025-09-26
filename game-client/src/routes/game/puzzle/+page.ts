import { PuzzleState, selectedPuzzle } from '$lib/puzzle/selected-puzzle.svelte.js';
import { supabase } from '$lib/supabase/db.svelte';
import type { TaskType } from '../../../types/alias.js';

export const load = async ({ url }) => {
	const pointId = url.searchParams.get('pointId');
	const actionType = url.searchParams.get('type');

	if (pointId == null) {
		throw new Error('pointId parameter is mandatory, but not provided.');
	}

	if (
		actionType == null ||
		!['attack', 'attack_and_claim', 'repair', 'claim'].includes(actionType)
	) {
		throw new Error('type parameter is mandatory, but not provided.');
	}

	const { data, error } = await supabase.functions.invoke('puzzle-generator');

	if (error) throw error;

	selectedPuzzle.selectedPuzzle = new PuzzleState({
		puzzle: data,
		actionType: actionType as TaskType,
		pointId
	});
};
