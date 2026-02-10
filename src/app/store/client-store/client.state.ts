export interface ClientState {
    clients: any[];
    selectedClient: any;
    loading: boolean;
    error: string | null;
}

export const initialState: ClientState = {
    clients: [],
    selectedClient: null,
    loading: false,
    error: null
};
