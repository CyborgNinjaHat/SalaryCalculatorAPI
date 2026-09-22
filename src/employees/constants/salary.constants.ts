import { EMPLOYEE_ROLES, type EmployeeRole } from './employee.constants.js';

export const DEFAULT_BASE_SALARY = 500;

export const SENIORITY_BONUS_RATES: Record<EmployeeRole, { rate: number; cap: number }> = {
  [EMPLOYEE_ROLES.EMPLOYEE]: { rate: 0.03, cap: 0.3 },
  [EMPLOYEE_ROLES.MANAGER]: { rate: 0.05, cap: 0.4 },
  [EMPLOYEE_ROLES.SALES]: { rate: 0.01, cap: 0.35 },
};

export const SUBORDINATE_BONUS_RATES: Record<EmployeeRole, number> = {
  [EMPLOYEE_ROLES.EMPLOYEE]: 0,
  [EMPLOYEE_ROLES.MANAGER]: 0.005,
  [EMPLOYEE_ROLES.SALES]: 0.003,
};
