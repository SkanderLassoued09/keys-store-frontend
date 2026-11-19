import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from 'src/api.config';

@Injectable({ providedIn: 'root' })
export class ArticleService {
    private readonly baseUrl = `${API_CONFIG.baseUrl}/article`;

    constructor(private readonly httpClient: HttpClient) {}

    /** Several models of one family in one request (e.g. VAC1 … VAC33). */
    createMany(articles: any[]): Observable<any[]> {
        return this.httpClient.post<any[]>(`${this.baseUrl}/bulk`, { articles });
    }

    /** Same purchase/selling price on every article of a family. */
    setFamilyPrices(family: string, purchasePrice: number, sellingPrice: number): Observable<{ matched: number; modified: number }> {
        return this.httpClient.patch<{ matched: number; modified: number }>(`${this.baseUrl}/family-prices`, { family, purchasePrice, sellingPrice });
    }

    createArticle(article: any): Observable<any> {
        console.log(article);
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

    deleteArticle(id: string): Observable<void> {
        return this.httpClient.delete<void>(`${this.baseUrl}/${id}`);
    }
}
