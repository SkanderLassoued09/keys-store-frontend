import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from 'src/api.config';

export type WorkTaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED';

export interface WorkTask {
    _id?: string;
    title: string;
    description?: string;
    status: WorkTaskStatus;
    priority?: string;
    employee?: any;
    dueDate?: string;
    createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class WorkTaskService {
    private readonly baseUrl = `${API_CONFIG.baseUrl}/work-task`;

    constructor(private readonly http: HttpClient) {}

    getAll(): Observable<WorkTask[]> {
        return this.http.get<WorkTask[]>(this.baseUrl);
    }

    create(payload: Partial<WorkTask>): Observable<WorkTask> {
        return this.http.post<WorkTask>(this.baseUrl, payload);
    }

    update(id: string, payload: Partial<WorkTask>): Observable<WorkTask> {
        return this.http.put<WorkTask>(`${this.baseUrl}/${id}`, payload);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/${id}`);
    }
}
