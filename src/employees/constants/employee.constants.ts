export const EMPLOYEE_ROLES = {
  EMPLOYEE: 'employee',
  MANAGER: 'manager',
  SALES: 'sales',
} as const;

export type EmployeeRole = (typeof EMPLOYEE_ROLES)[keyof typeof EMPLOYEE_ROLES];
