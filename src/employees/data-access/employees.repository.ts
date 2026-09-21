import { Injectable, Inject } from '@nestjs/common';
import { sql, eq, getTableColumns } from 'drizzle-orm';
import { DATABASE } from '../../database/database.module.js';
import { employees } from '../../database/schema.js';

import type { Database } from '../../database/database.types.js';
import type {
  CreateEmployeeDto,
  EmployeeId,
  UpdateEmployeeDto,
} from '../schemas/employees.schemas.js';

@Injectable()
export class EmployeesRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async findAll() {
    return this.db.select().from(employees);
  }

  async findById(id: EmployeeId) {
    const [employee] = await this.db.select().from(employees).where(eq(employees.id, id));

    return employee ?? null;
  }

  async findDirectSubordinates(id: EmployeeId) {
    return this.db.select().from(employees).where(eq(employees.supervisorId, id));
  }

  async findAllSubordinates(id: EmployeeId) {
    const subordinates = this.db.$with('subordinates').as(
      this.db
        .select(getTableColumns(employees))
        .from(employees)
        .where(eq(employees.supervisorId, id))
        .unionAll(
          this.db
            .select(getTableColumns(employees))
            .from(employees)
            .innerJoin(sql`subordinates`, eq(employees.supervisorId, sql`subordinates.id`)),
        ),
    );

    return this.db.with(subordinates).select().from(subordinates);
  }

  async create(data: CreateEmployeeDto) {
    const [employee] = await this.db.insert(employees).values(data).returning();

    return employee;
  }

  async update(id: EmployeeId, data: UpdateEmployeeDto) {
    if (Object.keys(data).length === 0) {
      return this.findById(id);
    }

    const [employee] = await this.db
      .update(employees)
      .set(data)
      .where(eq(employees.id, id))
      .returning();

    return employee ?? null;
  }

  async delete(id: EmployeeId) {
    const [employee] = await this.db.delete(employees).where(eq(employees.id, id)).returning();

    return employee ?? null;
  }
}
