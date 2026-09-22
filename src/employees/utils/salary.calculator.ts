import { EMPLOYEE_ROLES, type EmployeeRole } from '../constants/employee.constants.js';
import { SENIORITY_BONUS_RATES, SUBORDINATE_BONUS_RATES } from '../constants/salary.constants.js';

import type { Employee, EmployeeId } from '../schemas/employees.schemas.js';

const getYearsWorked = (hireDate: string) => {
  const joined = new Date(hireDate);
  const now = new Date();

  const yearsWorked = now.getFullYear() - joined.getFullYear();

  const anniversaryPassed =
    now.getMonth() < joined.getMonth() ||
    (now.getMonth() === joined.getMonth() && now.getDate() < joined.getDate());

  return anniversaryPassed ? yearsWorked - 1 : yearsWorked;
};

const getSeniorityBonus = (base: number, yearsWorked: number, role: EmployeeRole) => {
  const { rate, cap } = SENIORITY_BONUS_RATES[role];

  return base * Math.min(rate * yearsWorked, cap);
};

const getSubordinateBonus = (role: EmployeeRole, subordinatesSalaries: number[]) => {
  const rate = SUBORDINATE_BONUS_RATES[role];

  return subordinatesSalaries.reduce((sum, salary) => sum + salary, 0) * rate;
};

const roundSalary = (salary: number) => Math.round(salary * 100) / 100;

export const calculateSalaries = (
  rootEmployees: Employee[],
  subordinatesMap: Map<EmployeeId, Employee[]>,
): Map<EmployeeId, number> => {
  const salaryMap = new Map<EmployeeId, number>();

  const calculate = (employee: Employee): { salary: number; subordinateSalaries: number[] } => {
    const directSubordinates = subordinatesMap.get(employee.id) ?? [];
    const subordinateResults = directSubordinates.map(calculate);
    const directSubordinateSalaries = subordinateResults.map((result) => result.salary);

    const allSubordinateSalaries: number[] = [];

    for (const subordinateResult of subordinateResults) {
      allSubordinateSalaries.push(
        subordinateResult.salary,
        ...subordinateResult.subordinateSalaries,
      );
    }

    const yearsWorked = getYearsWorked(employee.hireDate);

    const subordinateSalariesForBonus =
      employee.role === EMPLOYEE_ROLES.SALES ? allSubordinateSalaries : directSubordinateSalaries;

    const salary = roundSalary(
      employee.baseSalary +
        getSeniorityBonus(employee.baseSalary, yearsWorked, employee.role) +
        getSubordinateBonus(employee.role, subordinateSalariesForBonus),
    );

    salaryMap.set(employee.id, salary);

    return {
      salary,
      subordinateSalaries: allSubordinateSalaries,
    };
  };

  for (const employee of rootEmployees) {
    calculate(employee);
  }

  return salaryMap;
};
