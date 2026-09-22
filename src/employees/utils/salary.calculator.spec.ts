import { describe, beforeEach, afterEach, vi, it, expect } from 'vitest';
import { EMPLOYEE_ROLES } from '../constants/employee.constants.js';
import { calculateSalaries } from './salary.calculator.js';

import type { Employee, EmployeeId } from '../schemas/employees.schemas.js';

const makeEmployee = (overrides: Partial<Employee> = {}): Employee => ({
  id: 1,
  name: 'CyborgNinjaHat',
  hireDate: '2020-01-01',
  baseSalary: 1000,
  role: EMPLOYEE_ROLES.EMPLOYEE,
  supervisorId: null,
  createdAt: '2002-03-11T00:00:00.000Z',
  updatedAt: '2026-03-11T00:00:00.000Z',
  ...overrides,
});

describe('calculateSalaries', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-01-01T00:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('EMPLOYEE', () => {
    it('receives 3% for each year worked', () => {
      const employee = makeEmployee({
        hireDate: '2023-01-01',
        baseSalary: 1000,
      });

      const salaries = calculateSalaries(
        [employee],
        new Map<EmployeeId, Employee[]>([[employee.id, []]]),
      );

      expect(salaries.get(employee.id)).toBe(1210);
    });

    it('does not receive a bonus if worked less than one year', () => {
      const employee = makeEmployee({
        hireDate: '2029-12-31',
        baseSalary: 1000,
      });

      const salaries = calculateSalaries([employee], new Map([[employee.id, []]]));

      expect(salaries.get(employee.id)).toBe(1000);
    });

    it('caps seniority bonus at 30% of base salary', () => {
      const employee = makeEmployee({
        hireDate: '2019-01-01',
        baseSalary: 1000,
      });

      const salaries = calculateSalaries([employee], new Map([[employee.id, []]]));

      expect(salaries.get(employee.id)).toBe(1300);
    });
  });

  describe('MANAGER', () => {
    it('receives 5% for each year worked', () => {
      const manager = makeEmployee({
        hireDate: '2023-01-01',
        role: EMPLOYEE_ROLES.MANAGER,
        baseSalary: 1000,
      });

      const salaries = calculateSalaries(
        [manager],
        new Map<EmployeeId, Employee[]>([[manager.id, []]]),
      );

      expect(salaries.get(manager.id)).toBe(1350);
    });

    it('receives 0.5% from direct subordinates', () => {
      const manager = makeEmployee({
        id: 1,
        role: EMPLOYEE_ROLES.MANAGER,
        hireDate: '2030-01-01',
        baseSalary: 1000,
      });

      const employee1 = makeEmployee({
        id: 2,
        supervisorId: manager.id,
        hireDate: '2030-01-01',
        baseSalary: 1000,
      });

      const employee2 = makeEmployee({
        id: 3,
        supervisorId: manager.id,
        hireDate: '2030-01-01',
        baseSalary: 1000,
      });

      const hierarchy = new Map<EmployeeId, Employee[]>([
        [manager.id, [employee1, employee2]],
        [employee1.id, []],
        [employee2.id, []],
      ]);

      const salaries = calculateSalaries([manager], hierarchy);

      expect(salaries.get(employee1.id)).toBe(1000);
      expect(salaries.get(employee2.id)).toBe(1000);
      expect(salaries.get(manager.id)).toBe(1010);
    });

    it('caps seniority bonus at 40% of base salary', () => {
      const manager = makeEmployee({
        id: 1,
        role: EMPLOYEE_ROLES.MANAGER,
        hireDate: '2020-01-01',
        baseSalary: 1000,
      });

      const salaries = calculateSalaries([manager], new Map([[manager.id, []]]));

      expect(salaries.get(manager.id)).toBe(1400);
    });

    it('ignores bonuses from subordinates other than first level', () => {
      const manager = makeEmployee({
        id: 1,
        role: EMPLOYEE_ROLES.MANAGER,
        hireDate: '2030-01-01',
        baseSalary: 1000,
      });

      const manager2 = makeEmployee({
        id: 2,
        role: EMPLOYEE_ROLES.MANAGER,
        hireDate: '2030-01-01',
        baseSalary: 1000,
        supervisorId: manager.id,
      });

      const employee = makeEmployee({
        id: 3,
        hireDate: '2029-01-01',
        baseSalary: 1000,
        supervisorId: manager2.id,
      });

      const hierarchy = new Map<EmployeeId, Employee[]>([
        [manager.id, [manager2]],
        [manager2.id, [employee]],
        [employee.id, []],
      ]);

      const salaries = calculateSalaries([manager], hierarchy);

      expect(salaries.get(employee.id)).toBe(1030);
      expect(salaries.get(manager2.id)).toBe(1005.15);
      expect(salaries.get(manager.id)).toBe(1005.03);
    });
  });

  describe('SALES', () => {
    it('receives 1% for each year worked', () => {
      const sales = makeEmployee({
        hireDate: '2000-01-01',
        role: EMPLOYEE_ROLES.SALES,
        baseSalary: 1000,
      });

      const salaries = calculateSalaries(
        [sales],
        new Map<EmployeeId, Employee[]>([[sales.id, []]]),
      );

      expect(salaries.get(sales.id)).toBe(1300);
    });

    it('caps seniority bonus at 35% of base salary', () => {
      const sales = makeEmployee({
        id: 1,
        role: EMPLOYEE_ROLES.SALES,
        hireDate: '1994-01-01',
        baseSalary: 1000,
      });

      const salaries = calculateSalaries([sales], new Map([[sales.id, []]]));

      expect(salaries.get(sales.id)).toBe(1350);
    });

    it('receives 0.3% from all subordinates', () => {
      const sales = makeEmployee({
        id: 1,
        role: EMPLOYEE_ROLES.SALES,
        hireDate: '2030-01-01',
        baseSalary: 1000,
      });

      const manager = makeEmployee({
        id: 2,
        role: EMPLOYEE_ROLES.MANAGER,
        hireDate: '2030-01-01',
        baseSalary: 1000,
        supervisorId: sales.id,
      });

      const employee1 = makeEmployee({
        id: 3,
        hireDate: '2030-01-01',
        baseSalary: 1000,
        supervisorId: manager.id,
      });

      const employee2 = makeEmployee({
        id: 4,
        hireDate: '2030-01-01',
        baseSalary: 1000,
        supervisorId: manager.id,
      });

      const hierarchy = new Map<EmployeeId, Employee[]>([
        [sales.id, [manager]],
        [manager.id, [employee1, employee2]],
        [employee1.id, []],
        [employee2.id, []],
      ]);

      const salaries = calculateSalaries([sales], hierarchy);

      expect(salaries.get(employee1.id)).toBe(1000);
      expect(salaries.get(employee2.id)).toBe(1000);
      expect(salaries.get(manager.id)).toBe(1010);
      expect(salaries.get(sales.id)).toBe(1009.03);
    });
  });

  describe('edge cases', () => {
    it('handles multiple separate roots in the tree', () => {
      const manager1 = makeEmployee({
        id: 1,
        role: EMPLOYEE_ROLES.MANAGER,
        hireDate: '2030-01-01',
        baseSalary: 1000,
      });

      const manager2 = makeEmployee({
        id: 2,
        role: EMPLOYEE_ROLES.MANAGER,
        hireDate: '2030-01-01',
        baseSalary: 2000,
      });

      const employee1 = makeEmployee({
        id: 3,
        hireDate: '2030-01-01',
        baseSalary: 2000,
        supervisorId: manager1.id,
      });

      const employee2 = makeEmployee({
        id: 4,
        hireDate: '2030-01-01',
        baseSalary: 1000,
        supervisorId: manager2.id,
      });

      const hierarchy = new Map<EmployeeId, Employee[]>([
        [manager1.id, [employee1]],
        [employee1.id, []],
        [manager2.id, [employee2]],
        [employee2.id, []],
      ]);

      const salaries = calculateSalaries([manager1, manager2], hierarchy);

      expect(salaries.get(manager1.id)).toBe(1010);
      expect(salaries.get(employee1.id)).toBe(2000);
      expect(salaries.get(manager2.id)).toBe(2005);
      expect(salaries.get(employee2.id)).toBe(1000);
    });

    it('performs calculations for an employee starting from the middle of the tree', () => {
      const head = makeEmployee({
        id: 1,
        role: EMPLOYEE_ROLES.MANAGER,
        hireDate: '2030-01-01',
        baseSalary: 1,
      });

      const sales = makeEmployee({
        id: 2,
        role: EMPLOYEE_ROLES.SALES,
        hireDate: '2030-01-01',
        baseSalary: 2000,
        supervisorId: head.id,
      });

      const manager = makeEmployee({
        id: 3,
        role: EMPLOYEE_ROLES.MANAGER,
        hireDate: '2030-01-01',
        baseSalary: 2000,
        supervisorId: sales.id,
      });

      const employee = makeEmployee({
        id: 4,
        hireDate: '2030-01-01',
        baseSalary: 1000,
        supervisorId: manager.id,
      });

      const hierarchy = new Map<EmployeeId, Employee[]>([
        [head.id, [sales]],
        [sales.id, [manager]],
        [manager.id, [employee]],
        [employee.id, []],
      ]);

      const salaries = calculateSalaries([sales], hierarchy);

      expect(salaries.get(head.id)).toBe(undefined);
      expect(salaries.get(sales.id)).toBe(2009.02);
      expect(salaries.get(manager.id)).toBe(2005);
      expect(salaries.get(employee.id)).toBe(1000);
    });
  });
});
