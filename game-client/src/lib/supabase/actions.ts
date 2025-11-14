import { supabase } from './db.svelte';
import type { TaskType } from '../../types/alias';

export interface ActionRequest {
	type: TaskType;
	point: string;
}

/**
 * Perform an action on a point by calling the perform_action edge function
 */
export async function performAction(action: ActionRequest): Promise<void> {
	// Check if user is authenticated
	const {
		data: { session }
	} = await supabase.auth.getSession();
	if (!session) {
		throw new Error('User not authenticated');
	}

	console.log('Calling perform_action with:', action);
	console.log('User authenticated:', session.user.id);

	const { data, error } = await supabase.functions.invoke('perform_action', {
		body: action
	});

	if (error) {
		console.error('Edge function error:', error);
		throw new Error(error.message || 'Failed to perform action');
	}

	// Edge function returns 204 No Content on success
	if (data && data.error) {
		console.error('Action error:', data.error);
		throw new Error(data.error);
	}

	console.log('Action completed successfully');
}

/**
 * Get action point cost for a specific action type
 */
export async function getActionPointCost(actionType: TaskType): Promise<number> {
	const { data, error } = await supabase.rpc('get_ap_cost_for_action', {
		a_action_type: actionType
	});

	if (error) {
		console.warn('Error getting action cost:', error.message);
		// Return default costs as fallback
		const defaults: Record<TaskType, number> = {
			attack: 10,
			claim: 15,
			repair: 8,
			attack_and_claim: 25,
			upgrade: 50
		};
		return defaults[actionType] || 0;
	}

	return data || 0;
}
