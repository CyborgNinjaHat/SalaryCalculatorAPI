import * as z from 'zod';
import { EMPLOYEE_ROLES } from '../constants/employee.constants.js';
import { DEFAULT_BASE_SALARY } from '../constants/salary.constants.js';

export const employeeIdSchema = z.coerce.number().int().positive();
const employeeRolesSchema = z.enum(EMPLOYEE_ROLES);
const hireDateSchema = z.iso.date().refine(
  (date) => {
    const now = new Date();
    return new Date(date) <= now;
  },
  { message: 'Hire date cannot be in the future' },
);
const timestampSchema = z.iso.datetime();

const employeeFieldsSchema = z.object({
  name: z.string().trim().min(1).max(255),
  hireDate: hireDateSchema,
  baseSalary: z.number().positive(),
  role: employeeRolesSchema,
  supervisorId: employeeIdSchema.nullable(),
});

const employeeSchema = employeeFieldsSchema.extend({
  id: employeeIdSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const createEmployeeSchema = employeeFieldsSchema.extend({
  baseSalary: employeeFieldsSchema.shape.baseSalary.default(DEFAULT_BASE_SALARY),
  supervisorId: employeeFieldsSchema.shape.supervisorId.default(null),
});

export const updateEmployeeSchema = employeeFieldsSchema.partial();

export type EmployeeId = z.infer<typeof employeeIdSchema>;
export type Employee = z.infer<typeof employeeSchema>;
export type EmployeeWithSalary = Employee & { salary: number };
export type CreateEmployeeDto = z.infer<typeof employeeFieldsSchema>;
export type UpdateEmployeeDto = z.infer<typeof updateEmployeeSchema>;
