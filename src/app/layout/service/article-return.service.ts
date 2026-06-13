import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from 'src/api.config';

@Injectable({ providedIn: 'root' })
export class ArticleReturnService {
    private readonly baseUrl = `${API_CONFIG.baseUrl}/article-return`;

    constructor(private readonly http: HttpClient) {}

    getAll(): Observable<any[]> {
        return this.http.get<any[]>(this.baseUrl);
    }

    create(payload: any): Observable<any> {
        return this.http.post<any>(this.baseUrl, payload);
    }
}
