import type { Bounds } from './bounds';

export interface MapSettings {
	initial_bounds: Bounds;
	initial_level: number;
	tile_server: string;
}
