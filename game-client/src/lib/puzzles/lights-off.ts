export interface LightsOffPuzzle {
	field: boolean[][];
	version: 1;
}

export interface LightsOffMove {
	row: number;
	col: number;
}

export interface LightsOffResult {
	moves: LightsOffMove[];
}
