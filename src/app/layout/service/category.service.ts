import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from 'src/api.config';

export interface Category {
    _id?: string;
    name: string;
    image?: string;
    active?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
    private readonly baseUrl = `${API_CONFIG.baseUrl}/category`;

    constructor(private readonly http: HttpClient) {}

    getAll(): Observable<Category[]> {
        return this.http.get<Category[]>(this.baseUrl);
    }

    create(payload: Partial<Category>): Observable<Category> {
        return this.http.post<Category>(this.baseUrl, payload);
    }

    update(id: string, payload: Partial<Category>): Observable<Category> {
        return this.http.put<Category>(`${this.baseUrl}/${id}`, payload);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
}
