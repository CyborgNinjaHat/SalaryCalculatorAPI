import { Module } from '@nestjs/common';
import { EmployeesController } from './api/employees.controller.js';
import { EmployeesRepository } from './data-access/employees.repository.js';
import { EmployeesService } from './services/employees.service.js';

@Module({
  controllers: [EmployeesController],
  providers: [EmployeesService, EmployeesRepository],
})
export class EmployeesModule {}
