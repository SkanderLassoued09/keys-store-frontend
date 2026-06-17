import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from 'src/api.config';

export interface SubCategory {
    _id?: string;
    name: string;
    // Either a populated category object (list/findOne) or a raw id string.
    category: any;
    active?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class SubCategoryService {
    private readonly baseUrl = `${API_CONFIG.baseUrl}/sub-category`;

    constructor(private readonly http: HttpClient) {}

    getAll(categoryId?: string): Observable<SubCategory[]> {
        let params = new HttpParams();
        if (categoryId) {
            params = params.set('categoryId', categoryId);
        }
        return this.http.get<SubCategory[]>(this.baseUrl, { params });
    }

    create(payload: Partial<SubCategory>): Observable<SubCategory> {
        return this.http.post<SubCategory>(this.baseUrl, payload);
    }

    update(id: string, payload: Partial<SubCategory>): Observable<SubCategory> {
        return this.http.put<SubCategory>(`${this.baseUrl}/${id}`, payload);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
}
