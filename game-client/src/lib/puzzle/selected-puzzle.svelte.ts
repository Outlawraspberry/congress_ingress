import type { Puzzle, TaskType } from '../../types/alias';

export class PuzzleState {
	private timerId: number | null = null;
	private timeout: number;
	private isTimeout: boolean;
	state: {
		puzzle: Puzzle['Row'];
		secondsUntilTimeout: number;
		actionType: TaskType;
		pointId: string;
	};

	constructor({
		pointId,
		actionType,
		puzzle
	}: {
		puzzle: Puzzle['Row'];
		actionType: TaskType;
		pointId: string;
	}) {
		const now = Date.now();
		this.timeout = Date.parse(puzzle.created_at) + 10000;

		this.state = $state({
			puzzle: puzzle,
			secondsUntilTimeout: this.timeout - now,
			actionType,
			pointId
		});

		this.isTimeout = this.state.secondsUntilTimeout <= 0;

		if (!this.isTimeout) {
			// setInterval is actually a number, not a NodeJs.Timeout
			this.timerId = setInterval(this.interval, 100) as unknown as number;
		}
	}

	private interval = () => {
		const now = Date.now();
		const timeUntilTimeout = this.timeout - now;

		if (timeUntilTimeout > 0) {
			this.state.secondsUntilTimeout = timeUntilTimeout;
		} else {
			this.state.secondsUntilTimeout = 0;
			this.isTimeout = true;
			this.state.puzzle.timeout = true;

			if (this.timerId != null) {
				clearInterval(this.timerId);
				this.timerId = null;
			}
		}
	};
}

export const selectedPuzzle: {
	selectedPuzzle: PuzzleState | null;
} = $state({ selectedPuzzle: null });
