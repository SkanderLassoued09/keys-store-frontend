import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EmployeeState } from './employee.reducer';

export const selectEmployeeState = createFeatureSelector<EmployeeState>('employee');

export const selectAllEmployees = createSelector(selectEmployeeState, (state: EmployeeState) => state.employees);

export const selectEmployeeLoading = createSelector(selectEmployeeState, (state: EmployeeState) => state.loading);

export const selectEmployeeError = createSelector(selectEmployeeState, (state: EmployeeState) => state.error);

export const selectEmployeeById = (id: string) => createSelector(selectAllEmployees, (employees) => employees.find((emp) => emp._id === id));

// Employee for dropdown
export const selectEmployeeDropdown = createSelector(selectAllEmployees, (employees) =>
    employees.map((employee) => ({
        id: employee._id,
        name: `${employee.firstName} ${employee.lastName}`
    }))
);
