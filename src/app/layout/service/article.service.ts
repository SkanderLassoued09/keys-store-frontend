import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from 'src/api.config';

@Injectable({ providedIn: 'root' })
export class ArticleService {
    private readonly baseUrl = `${API_CONFIG.baseUrl}/articles`;

    constructor(private readonly httpClient: HttpClient) {}

    createArticle(article: any): Observable<any> {
        return this.httpClient.post<any>(this.baseUrl, article);
    }

    getAllArticles(): Observable<any[]> {
        return this.httpClient.get<any[]>(this.baseUrl);
    }

    getArticleById(id: number): Observable<any> {
        return this.httpClient.get<any>(`${this.baseUrl}/${id}`);
    }

    updateArticle(id: number, article: Partial<any>): Observable<any> {
        return this.httpClient.put<any>(`${this.baseUrl}/${id}`, article);
    }

    deleteArticle(id: number): Observable<void> {
        return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
    }
}
