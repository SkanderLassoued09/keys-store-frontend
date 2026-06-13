export type WorkOrderEntryType = 'article' | 'service';
export type WorkOrderTransactionType = 'SALE' | 'RETURN_REPLACED' | 'RETURN_REFUNDED';

export type WorkOrderStatus = 'pending' | 'in-progress' | 'done';

export interface EmployeeRef {
    _id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
}

export interface ClientRef {
    _id: string;
    name?: string;
}

export interface MachineRef {
    _id: string;
    name?: string;
}

// A WorkOrder ref field arrives as either a populated object (list/findOne) or
// a raw ObjectId string (after a fresh create). Templates and form patches must
// handle both shapes — use refId() / displayEmployee() helpers.
export type Ref<T> = string | T | null;

export interface WorkOrder {
    _id?: string;
    name: string;
    description?: string;
    quantity: number;
    price: number;
    duration?: string | number;
    entryType?: WorkOrderEntryType;
    transactionType?: WorkOrderTransactionType;
    category?: string;
    customerName?: string;
    article?: Ref<{ _id: string; name?: string }>;
    employee?: Ref<EmployeeRef>;
    client?: Ref<ClientRef>;
    machine?: Ref<MachineRef>;
    status?: WorkOrderStatus;
    refunded?: boolean;
    refundedAt?: string;
    refundedAmount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export function refId(value: unknown): string | null {
    if (value == null) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && '_id' in (value as Record<string, unknown>)) {
        const id = (value as Record<string, unknown>)['_id'];
        return typeof id === 'string' ? id : null;
    }
    return null;
}

export function displayEmployee(value: Ref<EmployeeRef> | undefined): string {
    if (!value || typeof value === 'string') return '-';
    const full = `${value.firstName ?? ''} ${value.lastName ?? ''}`.trim();
    return full || value.name?.trim() || '-';
}

export function displayWorkOrderType(value: WorkOrder | undefined): string {
    if (value?.transactionType === 'RETURN_REPLACED') return 'Replaced Return';
    if (value?.transactionType === 'RETURN_REFUNDED') return 'Refunded Return';
    return value?.entryType === 'service' ? 'Service' : 'Article';
}

export function displayClient(value: Ref<ClientRef> | undefined): string {
    if (!value || typeof value === 'string') return '-';
    return value.name?.trim() || '-';
}

export function displayMachine(value: Ref<MachineRef> | undefined): string {
    if (!value || typeof value === 'string') return '-';
    return value.name?.trim() || '-';
}
