import type { Employee } from '../schemas/employees.schemas.js';

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
