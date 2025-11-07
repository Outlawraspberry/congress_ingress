import { selectedPoint } from '$lib/point/selected-point.svelte.js';
import { PuzzleState, selectedPuzzle } from '$lib/puzzle/selected-puzzle.svelte.js';
import { supabase } from '$lib/supabase/db.svelte';

export const load = async () => {
	const { data, error } = await supabase.functions.invoke('puzzle-generator');

	if (error) throw error;

	await selectedPoint.selectedPoint?.initCurrentUsers();

	selectedPuzzle.selectedPuzzle = new PuzzleState({
		puzzle: data
	});
};
