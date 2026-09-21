import { sql } from 'drizzle-orm';
import { sqliteTable, int, text, real, foreignKey, index } from 'drizzle-orm/sqlite-core';
import { EMPLOYEE_ROLES } from '../employees/constants/employee.constants.js';

export const employees = sqliteTable(
  'employees_table',
  {
    id: int().primaryKey({ autoIncrement: true }),
    name: text().notNull(),
    hireDate: text('hire_date').notNull(),
    baseSalary: real('base_salary').notNull(),
    role: text('role', {
      enum: [EMPLOYEE_ROLES.EMPLOYEE, EMPLOYEE_ROLES.MANAGER, EMPLOYEE_ROLES.SALES],
    }).notNull(),
    supervisorId: int('supervisor_id').default(sql`NULL`),
    createdAt: text('created_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text('updated_at')
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`)
      .$onUpdate(() => sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    foreignKey({
      columns: [table.supervisorId],
      foreignColumns: [table.id],
    }).onDelete('set null'),
    index('supervisor_id_idx').on(table.supervisorId),
  ],
);
