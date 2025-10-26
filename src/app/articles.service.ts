import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { apiConfig } from "../api.config";

@Injectable({
  providedIn: "root",
})
export class ArticlesService {
  constructor(private http: HttpClient) {}

  // ✅ Save new article
  saveArticle(article: any): Observable<any> {
    return this.http.post<any>(`${apiConfig.baseUrl}/article`, article);
  }

  // ✅ (Optional) Get all articles
  getArticles(): Observable<any[]> {
    return this.http.get<any[]>(`${apiConfig.baseUrl}/article`);
  }

  // ✅ (Optional) Update article
  updateArticle(id: string, article: Partial<any>): Observable<any> {
    return this.http.put<any>(`${apiConfig.baseUrl}/article/${id}`, article);
  }

  // ✅ (Optional) Delete article
  deleteArticle(id: string): Observable<void> {
    return this.http.delete<void>(`${apiConfig.baseUrl}/article/${id}`);
  }
}
