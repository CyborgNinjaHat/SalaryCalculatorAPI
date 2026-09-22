import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import {
  employeeIdSchema,
  createEmployeeSchema,
  updateEmployeeSchema,
  type EmployeeId,
  type CreateEmployeeDto,
  type UpdateEmployeeDto,
} from '../schemas/employees.schemas.js';
import { EmployeesService } from '../services/employees.service.js';
import { toEmployeeResponse, toEmployeeWithSalaryResponse } from './employees.response-mapper.js';

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  async create(@Body({ schema: createEmployeeSchema }) data: CreateEmployeeDto) {
    const employee = await this.employeesService.create(data);
    return toEmployeeResponse(employee);
  }

  @Get()
  async findAll() {
    const employees = await this.employeesService.findAll();
    return employees.map(toEmployeeResponse);
  }

  @Get('salaries')
  async getAllSalaries() {
    const employeesWithSalary = await this.employeesService.findAllSalaries();
    return employeesWithSalary.result.map(toEmployeeWithSalaryResponse);
  }

  @Get('salaries/total')
  async getSumOfSalaries() {
    const employeesWithSalary = await this.employeesService.findAllSalaries();
    return { sum: employeesWithSalary.sumOfSalaries };
  }

  @Get(':id/salary')
  async getSalary(@Param('id', { schema: employeeIdSchema }) id: EmployeeId) {
    const employeeWithSalary = await this.employeesService.findSalary(id);
    return toEmployeeWithSalaryResponse(employeeWithSalary);
  }

  @Get(':id')
  async findOne(@Param('id', { schema: employeeIdSchema }) id: EmployeeId) {
    const employee = await this.employeesService.findOne(id);
    return toEmployeeResponse(employee);
  }

  @Patch(':id')
  async update(
    @Param('id', { schema: employeeIdSchema }) id: EmployeeId,
    @Body({ schema: updateEmployeeSchema }) data: UpdateEmployeeDto,
  ) {
    const updatedEmployee = await this.employeesService.update(id, data);
    return toEmployeeResponse(updatedEmployee);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', { schema: employeeIdSchema }) id: EmployeeId) {
    await this.employeesService.remove(id);
  }
}
