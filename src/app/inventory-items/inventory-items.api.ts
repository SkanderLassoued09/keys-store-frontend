import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from 'src/api.config';

export interface ArticleUnique {
    _id: string;
    name: string;
    category?: string;
    image?: string;
    price: number;
    emplacements: string[];
}

export type SupplyStatus = 'INVENTORY' | 'SHOP';
export interface ShopSupply {
    _id: string;
    name: string;
    category?: string;
    price: number;
    emplacements: string[];
    quantity: number;
    status: SupplyStatus;
}

export interface Worth {
    uniques: { value: number; count: number };
    supplies: { inventory: { value: number; quantity: number }; shop: { value: number; quantity: number }; value: number };
    total: number;
}

// LOCATION = emplacements (articles, uniques, supplies); the other two are categories.
export type OptionType = 'LOCATION' | 'UNIQUE_CATEGORY' | 'SUPPLY_CATEGORY';
export interface InventoryOption {
    _id: string;
    type: OptionType;
    name: string;
    usage: number;
}

export const FALLBACK_IMAGE =
    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="%23e5e7eb"/><path d="M20 42l8-10 6 7 5-6 9 9H20z" fill="%239ca3af"/><circle cx="24" cy="24" r="5" fill="%239ca3af"/></svg>';

export const errorText = (e: any) => e?.error?.message || e?.message || 'Opération échouée';

// Thin HttpClient wrapper: these lists are small and page-local, no NgRx slice.
@Injectable({ providedIn: 'root' })
export class InventoryItemsApi {
    private readonly http = inject(HttpClient);
    private readonly api = API_CONFIG.baseUrl;

    options(type: OptionType): Observable<InventoryOption[]> {
        return this.http.get<InventoryOption[]>(`${this.api}/inventory-option`, { params: { type } });
    }
    createOption(type: OptionType, name: string) {
        return this.http.post<InventoryOption>(`${this.api}/inventory-option`, { type, name });
    }
    renameOption(id: string, name: string) {
        return this.http.put<InventoryOption>(`${this.api}/inventory-option/${id}`, { name });
    }
    deleteOption(id: string) {
        return this.http.delete(`${this.api}/inventory-option/${id}`);
    }

    uniques() {
        return this.http.get<ArticleUnique[]>(`${this.api}/article-unique`);
    }
    saveUnique(id: string | null, body: unknown) {
        return id ? this.http.put(`${this.api}/article-unique/${id}`, body) : this.http.post(`${this.api}/article-unique`, body);
    }
    deleteUnique(id: string) {
        return this.http.delete(`${this.api}/article-unique/${id}`);
    }

    supplies() {
        return this.http.get<ShopSupply[]>(`${this.api}/shop-supply`);
    }
    saveSupply(id: string | null, body: unknown) {
        return id ? this.http.put(`${this.api}/shop-supply/${id}`, body) : this.http.post(`${this.api}/shop-supply`, body);
    }
    deleteSupply(id: string) {
        return this.http.delete(`${this.api}/shop-supply/${id}`);
    }
    moveSupply(id: string, quantity: number) {
        return this.http.patch(`${this.api}/shop-supply/${id}/move`, { quantity });
    }
    adjustSupply(id: string, delta: number) {
        return this.http.patch(`${this.api}/shop-supply/${id}/adjust`, { delta });
    }
    worth() {
        return this.http.get<Worth>(`${this.api}/shop-supply/worth`);
    }
}
