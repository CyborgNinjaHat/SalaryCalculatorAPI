import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { EMPLOYEE_ROLES } from '../constants/employee.constants.js';
import { EmployeesRepository } from '../data-access/employees.repository.js';
import { calculateSalaries } from '../utils/salary.calculator.js';

import type {
  EmployeeId,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  Employee,
} from '../schemas/employees.schemas.js';

@Injectable()
export class EmployeesService {
  constructor(private readonly employeesRepository: EmployeesRepository) {}

  async create(data: CreateEmployeeDto) {
    if (data.supervisorId) {
      await this.validateSupervisor(data.supervisorId);
    }

    return this.employeesRepository.create(data);
  }

  async findAll() {
    return this.employeesRepository.findAll();
  }

  async findOne(id: EmployeeId) {
    const employee = await this.employeesRepository.findById(id);

    if (employee === null) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }

    return employee;
  }

  async update(id: EmployeeId, data: UpdateEmployeeDto) {
    const currentEmployee = await this.findOne(id);

    if (data.role === EMPLOYEE_ROLES.EMPLOYEE && data.role !== currentEmployee.role) {
      const subordinates = await this.employeesRepository.findDirectSubordinates(
        currentEmployee.id,
      );

      if (subordinates.length > 0) {
        throw new ConflictException(
          `Employee with id ${currentEmployee.id} cannot be demoted because they have subordinates`,
        );
      }
    }

    if (data.supervisorId) {
      await this.validateSupervisor(data.supervisorId, currentEmployee.id);
    }

    return this.employeesRepository.update(id, data);
  }

  async remove(id: EmployeeId) {
    const employee = await this.employeesRepository.delete(id);

    if (employee === null) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }
  }

  async findAllSalaries() {
    const allEmployees = await this.employeesRepository.findAll();
    const rootEmployees = allEmployees.filter((employee) => !employee.supervisorId);
    const subordinatesMap = this.buildSubordinatesMap(allEmployees);
    const salaryMap = calculateSalaries(rootEmployees, subordinatesMap);

    const result = allEmployees.map((employee) =>
      Object.assign({}, employee, {
        salary: salaryMap.get(employee.id) ?? 0,
      }),
    );

    const sumOfSalaries = result.reduce((acc, employee) => acc + employee.salary, 0);

    return { result, sumOfSalaries };
  }

  async findSalary(id: EmployeeId) {
    const employee = await this.findOne(id);
    const subordinates = await this.employeesRepository.findAllSubordinates(employee.id);
    const subordinatesMap = this.buildSubordinatesMap([employee, ...subordinates]);
    const salaryMap = calculateSalaries([employee], subordinatesMap);

    const result = Object.assign({}, employee, { salary: salaryMap.get(employee.id) ?? 0 });

    return result;
  }

  private async validateSupervisor(supervisorId: EmployeeId, employeeId?: EmployeeId) {
    if (employeeId === supervisorId) {
      throw new BadRequestException(
        `Employee with id ${employeeId} cannot be their own supervisor`,
      );
    }

    const supervisor = await this.employeesRepository.findById(supervisorId);

    if (!supervisor) {
      throw new NotFoundException(`Supervisor with id ${supervisorId} not found`);
    }

    if (supervisor.role === EMPLOYEE_ROLES.EMPLOYEE) {
      throw new BadRequestException(`Employee with id ${supervisorId} cannot be a supervisor`);
    }

    if (!employeeId) {
      return;
    }

    const subordinates = await this.employeesRepository.findAllSubordinates(employeeId);

    const isCreatingCycle = subordinates.some((subordinate) => subordinate.id === supervisorId);

    if (isCreatingCycle) {
      throw new ConflictException(`This supervisor assignment would create a hierarchy cycle`);
    }
  }

  private buildSubordinatesMap(employees: Employee[]): Map<EmployeeId, Employee[]> {
    const subordinatesMap = new Map<EmployeeId, Employee[]>();

    for (const employee of employees) {
      subordinatesMap.set(employee.id, []);
    }

    for (const employee of employees) {
      if (employee.supervisorId && subordinatesMap.has(employee.supervisorId)) {
        subordinatesMap.get(employee.supervisorId)!.push(employee);
      }
    }

    return subordinatesMap;
  }
}
