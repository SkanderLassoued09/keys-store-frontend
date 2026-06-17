import { WorkTask } from '@/layout/service/work-task.service';

export interface WorkTaskState {
    tasks: WorkTask[];
    loading: boolean;
    saving: boolean;
    error: string | null;
}

export const initialState: WorkTaskState = {
    tasks: [],
    loading: false,
    saving: false,
    error: null
};
