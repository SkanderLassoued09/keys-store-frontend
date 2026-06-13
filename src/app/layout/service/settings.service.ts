import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from 'src/api.config';

export interface AppSettings {
    serviceCommissionPercent: number;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
    private readonly baseUrl = `${API_CONFIG.baseUrl}/settings`;

    constructor(private readonly http: HttpClient) {}

    getSettings(): Observable<AppSettings> {
        return this.http.get<AppSettings>(this.baseUrl);
    }

    updateSettings(settings: Partial<AppSettings>): Observable<AppSettings> {
        return this.http.patch<AppSettings>(this.baseUrl, settings);
    }
}
