export interface ArticleState {
    articles: any[];
    selectedArticle: any;
    loading: boolean;
    error: string | null;
}

export const initialState: ArticleState = {
    articles: [],
    selectedArticle: null,
    loading: false,
    error: null
};
