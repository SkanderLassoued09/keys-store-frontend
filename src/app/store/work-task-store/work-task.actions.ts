import { createAction, props } from '@ngrx/store';
import { WorkTask } from '@/layout/service/work-task.service';

export const loadTasks = createAction('[WorkTask] Load');
export const loadTasksSuccess = createAction('[WorkTask] Load Success', props<{ tasks: WorkTask[] }>());
export const loadTasksFailure = createAction('[WorkTask] Load Failure', props<{ error: string }>());

export const createTask = createAction('[WorkTask] Create', props<{ payload: Partial<WorkTask> }>());
export const createTaskSuccess = createAction('[WorkTask] Create Success', props<{ task: WorkTask }>());
export const createTaskFailure = createAction('[WorkTask] Create Failure', props<{ error: string }>());

export const updateTask = createAction('[WorkTask] Update', props<{ id: string; payload: Partial<WorkTask> }>());
export const updateTaskSuccess = createAction('[WorkTask] Update Success', props<{ task: WorkTask }>());
export const updateTaskFailure = createAction('[WorkTask] Update Failure', props<{ error: string }>());

export const deleteTask = createAction('[WorkTask] Delete', props<{ id: string }>());
export const deleteTaskSuccess = createAction('[WorkTask] Delete Success', props<{ id: string }>());
export const deleteTaskFailure = createAction('[WorkTask] Delete Failure', props<{ error: string }>());
