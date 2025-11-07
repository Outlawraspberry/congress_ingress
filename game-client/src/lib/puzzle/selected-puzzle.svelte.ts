import type { Puzzle } from '../../types/alias';

export class PuzzleState {
	private timerId: number | null = null;
	private timeout: number;
	state: {
		puzzle: Puzzle['Row'];
		secondsUntilTimeout: number;
		isTimeout: boolean;
	};

	constructor({ puzzle }: { puzzle: Puzzle['Row'] }) {
		const now = Date.now();
		this.timeout = Date.parse(puzzle.expires_at);

		console.log(now, this.timeout, this.timeout - now);

		this.state = $state({
			puzzle: puzzle,
			secondsUntilTimeout: this.timeout - now,
			isTimeout: this.timeout - now <= 0
		});

		this.state.isTimeout = this.state.secondsUntilTimeout <= 0;

		if (!this.state.isTimeout) {
			// setInterval is actually a number, not a NodeJs.Timeout
			this.timerId = setInterval(this.interval, 100) as unknown as number;
		}
	}

	private interval = () => {
		const now = Date.now();
		const timeUntilTimeout = Math.round((this.timeout - now) / 1000);

		if (timeUntilTimeout > 0) {
			this.state.secondsUntilTimeout = timeUntilTimeout;
		} else {
			this.state.secondsUntilTimeout = 0;
			this.state.isTimeout = true;

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
