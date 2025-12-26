import { PUBLIC_C3_NAV_URL, PUBLIC_TILE_SERVER_URL } from '$env/static/public';
import type { Bounds } from './bounds';
import type { MapSettings } from './map-settings';

export class C3NavService {
	static readonly instance: C3NavService = new C3NavService();

	private static AUTH_URL = new URL('/api/v2/auth/session', PUBLIC_C3_NAV_URL);
	private static MAP_SETTINGS_URL = new URL('/api/v2/map/settings', PUBLIC_C3_NAV_URL);
	private static BOUNDS_URL = new URL('/api/v2/map/bounds', PUBLIC_C3_NAV_URL);

	public mapSettings: MapSettings | null = null;
	public bounds: Bounds | null = null;

	private sessionKey: string | null = null;

	async init(): Promise<void> {
		if (PUBLIC_TILE_SERVER_URL != null && PUBLIC_TILE_SERVER_URL.length > 0) {
			this.mapSettings = {
				initial_bounds: [
					[30.0, 85.0],
					[330.0, 260.0]
				],
				initial_level: 1,
				tile_server: PUBLIC_TILE_SERVER_URL
			};
			this.bounds = [
				[-25.52, -14.87],
				[1133.87, 1133.87]
			];
			return;
		}

		await this.getSession();

		await Promise.all([this.getMapSettings(), this.getBoundsOverall()]);
	}

	private static parseManualSettings(input: string): [MapSettings, Bounds] | null {
		if (input.length <= 0) return null;

		try {
			const parsed = JSON.parse(input);

			return [
				{
					initial_bounds: parsed.inital_bounds as unknown as Bounds,
					initial_level: parsed.initial_level as unknown as number,
					tile_server: parsed.tile_server as unknown as string
				},
				parsed.global_bounds as unknown as Bounds
			];
		} catch (e) {
			console.log('Cannot parse manual settings', e);
			return null;
		}
	}

	async destruct(): Promise<void> {
		this.sessionKey = null;
	}

	async getMapSettings(): Promise<MapSettings> {
		if (this.mapSettings != null) return this.mapSettings;

		this.mapSettings = await this.fetchJson<MapSettings>(C3NavService.MAP_SETTINGS_URL, {
			'X-API-Key': `session:${this.sessionKey}`
		});

		return this.mapSettings;
	}
	async getBoundsOverall(): Promise<Bounds> {
		if (this.bounds != null) return this.bounds;

		this.bounds = (
			await this.fetchJson<{ bounds: Bounds }>(C3NavService.BOUNDS_URL, {
				'X-API-Key': `session:${this.sessionKey}`
			})
		).bounds;

		return this.bounds;
	}

	private async getSession(): Promise<void> {
		const json = await this.fetchJson<{ key: string }>(C3NavService.AUTH_URL);

		this.sessionKey = json.key;
	}

	private async fetchJson<RESPONSE_TYPE>(
		url: URL,
		headers?: Record<string, string>
	): Promise<RESPONSE_TYPE> {
		const response = await fetch(url, {
			headers: {
				...headers,
				accept: 'application/json'
			}
		});

		if (response.status != 200)
			throw new Error(
				`Fetch from ${C3NavService.AUTH_URL} failed with code ${response.status} and ${response.statusText}`
			);

		return response.json() as Promise<RESPONSE_TYPE>;
	}
}
