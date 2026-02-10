import { createReducer, on } from '@ngrx/store';
import * as EmployeeActions from '../employee-store/emloyee.actions';

export interface EmployeeState {
    employees: any[];
    loading: boolean;
    error: string | null;
}

export const initialState: EmployeeState = {
    employees: [],
    loading: false,
    error: null
};

export const employeeReducer = createReducer(
    initialState,

    // Load Employees
    on(EmployeeActions.loadEmployee, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(EmployeeActions.loadEmployeeSuccess, (state, { employees }) => ({
        ...state,
        employees,
        loading: false,
        error: null
    })),

    on(EmployeeActions.loadEmployeeFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Create Employee
    on(EmployeeActions.createEmployee, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(EmployeeActions.createEmployeeSuccess, (state, { employee }) => ({
        ...state,
        employees: [...state.employees, employee],
        loading: false,
        error: null
    })),

    on(EmployeeActions.createEmployeeFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Update Employee
    on(EmployeeActions.updateEmployee, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(EmployeeActions.updateEmployeeSuccess, (state, { employee }) => ({
        ...state,
        employees: state.employees.map((emp) => (emp._id === employee._id ? employee : emp)),
        loading: false,
        error: null
    })),

    on(EmployeeActions.updateEmployeeFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    })),

    // Delete Employee
    on(EmployeeActions.deleteEmployee, (state) => ({
        ...state,
        loading: true,
        error: null
    })),

    on(EmployeeActions.deleteEmployeeSuccess, (state, { id }) => ({
        ...state,
        employees: state.employees.filter((emp) => emp._id !== id),
        loading: false,
        error: null
    })),

    on(EmployeeActions.deleteEmployeeFailure, (state, { error }) => ({
        ...state,
        loading: false,
        error
    }))
);
