export type ArticleReturnType = 'REPAIRED' | 'REPLACED' | 'REFUNDED';

export interface ArticleReturn {
    _id?: string;
    originalWorkOrder?: any;
    originalArticle: any;
    customerName?: string;
    employee: any;
    returnDate?: string;
    returnType: ArticleReturnType;
    notes?: string;
    repairAction?: string;
    replacementArticle?: any;
    replacementQuantity?: number;
    refundedAmount?: number;
    createdAt?: string;
}
