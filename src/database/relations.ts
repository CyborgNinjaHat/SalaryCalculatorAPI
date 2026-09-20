import { defineRelations } from 'drizzle-orm';
import { employees } from './schema.js';

export const relations = defineRelations({ employees }, (relation) => ({
  employees: {
    supervisor: relation.one.employees({
      from: relation.employees.supervisorId,
      to: relation.employees.id,
    }),
  },
}));
