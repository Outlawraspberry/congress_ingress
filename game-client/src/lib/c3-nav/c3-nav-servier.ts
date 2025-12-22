import { PUBLIC_C3_NAV_URL } from '$env/static/public';
import type { MapSettings } from './map-settings';

export class C3NavService {
	static readonly instance: C3NavService = new C3NavService();

	private static AUTH_URL = new URL('/api/v2/auth/session', PUBLIC_C3_NAV_URL);
	private static FETCH_UPDATES_URL = new URL('/api/v2/updates/fetch', PUBLIC_C3_NAV_URL);
	private static MAP_SETTINGS_URL = new URL('/api/v2/map/settings', PUBLIC_C3_NAV_URL);

	public mapSettings: MapSettings | null = null;

	private sessionKey: string | null = null;
	private updateInterval: number | null = null;

	async init(): Promise<void> {
		await this.getSession();

		await this.getMapSettings();

		// this.updateInterval = setInterval(this.fetchUpdate, 10000) as unknown as number;
	}

	async destruct(): Promise<void> {
		this.sessionKey = null;

		if (this.updateInterval != null) clearInterval(this.updateInterval);
	}

	async getMapSettings(): Promise<MapSettings> {
		if (this.mapSettings != null) return this.mapSettings;

		this.mapSettings = await this.fetchJson<MapSettings>(C3NavService.MAP_SETTINGS_URL, {
			'X-API-Key': `session:${this.sessionKey}`
		});

		return this.mapSettings;
	}

	private async getSession(): Promise<void> {
		const json = await this.fetchJson<{ key: string }>(C3NavService.AUTH_URL);

		this.sessionKey = json.key;
	}

	private fetchUpdate = async (): Promise<void> => {
		return await this.fetchJson(C3NavService.FETCH_UPDATES_URL, {
			'X-API-Key': `session:${this.sessionKey}`
		});
	};

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
