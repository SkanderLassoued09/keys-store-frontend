export interface MachineState {
    machines: any[];
    selectedMachine: any;
    loading: boolean;
    error: string | null;
}

export const initialState: MachineState = {
    machines: [],
    selectedMachine: null,
    loading: false,
    error: null
};
