import type { Employee, EmployeeWithSalary } from '../schemas/employees.schemas.js';

export const toEmployeeResponse = (employee: Employee) => ({
  id: employee.id,
  name: employee.name,
  hireDate: employee.hireDate,
  baseSalary: employee.baseSalary,
  role: employee.role,
  supervisorId: employee.supervisorId,
  createdAt: employee.createdAt,
  updatedAt: employee.updatedAt,
});

export const toEmployeeWithSalaryResponse = (employee: EmployeeWithSalary) => ({
  id: employee.id,
  name: employee.name,
  role: employee.role,
  baseSalary: employee.baseSalary,
  salary: employee.salary,
});
