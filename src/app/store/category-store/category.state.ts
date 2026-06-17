import { Category } from '@/layout/service/category.service';

export interface CategoryState {
    categories: Category[];
    loading: boolean;
    saving: boolean;
    error: string | null;
}

export const initialState: CategoryState = {
    categories: [],
    loading: false,
    saving: false,
    error: null
};
