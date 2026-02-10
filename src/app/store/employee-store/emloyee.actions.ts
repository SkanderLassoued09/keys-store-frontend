import { createAction, props } from '@ngrx/store';

// export interface Employee {
//     _id?: string;
//     firstName: string;
//     lastName: string;
//     phone?: string;
//     hireDate?: Date;
//     salary?: number;
//     services?: string[];
//     isActive?: boolean;
// }

// Load Employees
export const loadEmployee = createAction('[Employee] Load Employee');

export const loadEmployeeSuccess = createAction('[Employee] Load Employee Success', props<{ employees: any[] }>());

export const loadEmployeeFailure = createAction('[Employee] Load Employee Failure', props<{ error: string }>());

// Create Employee
export const createEmployee = createAction('[Employee] Create Employee', props<{ employee: Partial<any> }>());

export const createEmployeeSuccess = createAction('[Employee] Create Employee Success', props<{ employee: any }>());

export const createEmployeeFailure = createAction('[Employee] Create Employee Failure', props<{ error: string }>());

// Update Employee
export const updateEmployee = createAction('[Employee] Update Employee', props<{ employee: { id: string } & Partial<any> }>());

export const updateEmployeeSuccess = createAction('[Employee] Update Employee Success', props<{ employee: any }>());

export const updateEmployeeFailure = createAction('[Employee] Update Employee Failure', props<{ error: string }>());

// Delete Employee
export const deleteEmployee = createAction('[Employee] Delete Employee', props<{ id: string }>());

export const deleteEmployeeSuccess = createAction('[Employee] Delete Employee Success', props<{ id: string }>());

export const deleteEmployeeFailure = createAction('[Employee] Delete Employee Failure', props<{ error: string }>());
