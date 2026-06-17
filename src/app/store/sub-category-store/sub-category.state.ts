import { SubCategory } from '@/layout/service/sub-category.service';

export interface SubCategoryState {
    subCategories: SubCategory[];
    loading: boolean;
    saving: boolean;
    error: string | null;
}

export const initialState: SubCategoryState = {
    subCategories: [],
    loading: false,
    saving: false,
    error: null
};
