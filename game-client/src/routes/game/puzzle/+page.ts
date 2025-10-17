import { selectedPoint } from '$lib/point/selected-point.svelte.js';
import { PuzzleState, selectedPuzzle } from '$lib/puzzle/selected-puzzle.svelte.js';
import { supabase } from '$lib/supabase/db.svelte';
import type { TaskType } from '../../../types/alias.js';

export const load = async ({ url }) => {
	const actionType = url.searchParams.get('type');

	if (
		actionType == null ||
		!['attack', 'attack_and_claim', 'repair', 'claim'].includes(actionType)
	) {
		throw new Error('type parameter is mandatory, but not provided.');
	}

	const { data, error } = await supabase.functions.invoke('puzzle-generator');

	if (error) throw error;

	await selectedPoint.selectedPoint?.initCurrentUsers();

	selectedPuzzle.selectedPuzzle = new PuzzleState({
		puzzle: data,
		actionType: actionType as TaskType
	});
};
