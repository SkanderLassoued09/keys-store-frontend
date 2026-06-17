import { createReducer, on } from '@ngrx/store';
import { initialState } from './work-task.state';
import * as TaskActions from './work-task.actions';

export const workTaskReducer = createReducer(
    initialState,

    on(TaskActions.loadTasks, (state) => ({ ...state, loading: true, error: null })),
    on(TaskActions.loadTasksSuccess, (state, { tasks }) => ({ ...state, tasks, loading: false, error: null })),
    on(TaskActions.loadTasksFailure, (state, { error }) => ({ ...state, loading: false, error })),

    on(TaskActions.createTask, (state) => ({ ...state, saving: true, error: null })),
    on(TaskActions.createTaskSuccess, (state, { task }) => ({ ...state, tasks: [task, ...state.tasks], saving: false, error: null })),
    on(TaskActions.createTaskFailure, (state, { error }) => ({ ...state, saving: false, error })),

    on(TaskActions.updateTask, (state) => ({ ...state, saving: true, error: null })),
    on(TaskActions.updateTaskSuccess, (state, { task }) => ({
        ...state,
        tasks: state.tasks.map((t) => (t._id === task._id ? task : t)),
        saving: false,
        error: null
    })),
    on(TaskActions.updateTaskFailure, (state, { error }) => ({ ...state, saving: false, error })),

    on(TaskActions.deleteTask, (state) => ({ ...state, saving: true, error: null })),
    on(TaskActions.deleteTaskSuccess, (state, { id }) => ({ ...state, tasks: state.tasks.filter((t) => t._id !== id), saving: false, error: null })),
    on(TaskActions.deleteTaskFailure, (state, { error }) => ({ ...state, saving: false, error }))
);
