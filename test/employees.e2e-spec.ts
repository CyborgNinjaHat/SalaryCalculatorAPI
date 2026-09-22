import { Test, type TestingModule } from '@nestjs/testing';
import { sql } from 'drizzle-orm';
import { drizzle, type NodeSQLiteDatabase } from 'drizzle-orm/node-sqlite';
import { migrate } from 'drizzle-orm/node-sqlite/migrator';
import { DatabaseSync } from 'node:sqlite';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApplication } from '../src/app/app.setup.js';
import { DATABASE } from '../src/database/database.module.js';
import { relations } from '../src/database/relations.js';
import { employees } from '../src/database/schema.js';
import { EMPLOYEE_ROLES } from '../src/employees/constants/employee.constants.js';
import {
  DEFAULT_BASE_SALARY,
  SUBORDINATE_BONUS_RATES,
} from '../src/employees/constants/salary.constants.js';

import type { INestApplication } from '@nestjs/common';
import type { App } from 'supertest/types.js';

const SEED_DATA = [
  {
    id: 1,
    name: 'Petro Poroshenko',
    hireDate: '2014-05-25',
    baseSalary: 9000,
    role: EMPLOYEE_ROLES.MANAGER,
    supervisorId: null,
  },
  {
    id: 2,
    name: 'Jason Statham',
    hireDate: '2030-01-01',
    baseSalary: 5500,
    role: EMPLOYEE_ROLES.SALES,
    supervisorId: 1,
  },
  {
    id: 3,
    name: 'Elon MaxXx2005',
    hireDate: '2030-01-01',
    baseSalary: 4200,
    role: EMPLOYEE_ROLES.MANAGER,
    supervisorId: 2,
  },
  {
    id: 4,
    name: 'Dio Brando',
    hireDate: '2030-01-01',
    baseSalary: 2500,
    role: EMPLOYEE_ROLES.EMPLOYEE,
    supervisorId: 3,
  },
  {
    id: 5,
    name: 'Viktor Yakubovitch',
    hireDate: '2030-01-01',
    baseSalary: 5,
    role: EMPLOYEE_ROLES.EMPLOYEE,
    supervisorId: 3,
  },
];

describe('EmployeesModule', () => {
  let app: INestApplication<App>;
  let sqlite: DatabaseSync;
  let mockDb: NodeSQLiteDatabase<typeof relations>;

  const getEmployees = () => request(app.getHttpServer()).get('/employees');

  const getEmployee = (id: number | string) => request(app.getHttpServer()).get(`/employees/${id}`);

  const getEmployeeSalaries = () => request(app.getHttpServer()).get('/employees/salaries');

  const getEmployeeSalariesSum = () =>
    request(app.getHttpServer()).get('/employees/salaries/total');

  const getEmployeeSalary = (id: number | string) =>
    request(app.getHttpServer()).get(`/employees/${id}/salary`);

  const createEmployee = (payload: object) =>
    request(app.getHttpServer()).post('/employees').send(payload);

  const updateEmployee = (id: number | string, payload: object) =>
    request(app.getHttpServer()).patch(`/employees/${id}`).send(payload);

  const deleteEmployee = (id: number | string) =>
    request(app.getHttpServer()).delete(`/employees/${id}`);

  const resetDatabase = async () => {
    await mockDb.delete(employees);
    mockDb.run(sql`DELETE FROM sqlite_sequence WHERE name = 'employees_table';`);
    await mockDb.insert(employees).values(SEED_DATA);
  };

  beforeAll(async () => {
    sqlite = new DatabaseSync(':memory:');
    mockDb = drizzle({ client: sqlite, relations });
    migrate(mockDb, { migrationsFolder: './drizzle' });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(DATABASE)
      .useValue(mockDb)
      .compile();

    app = moduleFixture.createNestApplication();
    configureApplication(app);
    await app.init();
  });

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-01-01T00:00:00Z'));
    await resetDatabase();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  afterAll(async () => {
    await app.close();
    sqlite.close();
  });

  describe('GET /employees', () => {
    it('returns a list of all employees', () => getEmployees().expect(200));
  });

  describe('GET /employees/:id', () => {
    it('returns 200 for existing employee', () => getEmployee(1).expect(200));

    it('returns 400 for non-numeric ID', () => getEmployee('invalid').expect(400));

    it('returns 400 for non-positive ID', () => getEmployee(-1).expect(400));

    it('returns 404 for non-existent employee', () => getEmployee(1337).expect(404));
  });

  describe('GET /employees/salaries', () => {
    it('returns a list of all employees with calculated salaries', () =>
      getEmployeeSalaries().expect(200));
  });

  describe('GET /employees/salaries/total', () => {
    it('returns a sum of all employees calculated salaries', () =>
      getEmployeeSalariesSum().expect(200));
  });

  describe('GET /employees/:id/salary', () => {
    it('returns 200 for existing employee', () => getEmployeeSalary(1).expect(200));

    it('returns 404 for non-existent employee', () => getEmployeeSalary(1337).expect(404));
  });

  describe('POST /employees', () => {
    it('returns 400 for empty payload', () => createEmployee({}).expect(400));

    it('returns 400 for empty name', () =>
      createEmployee({
        name: '',
        hireDate: '2026-01-01',
        role: 'employee',
      }).expect(400));

    it('returns 400 for future hire date', () =>
      createEmployee({
        name: 'invalid',
        hireDate: '2077-01-01',
        role: 'employee',
      }).expect(400));

    it('returns 400 for invalid hire date', () =>
      createEmployee({
        name: 'invalid',
        hireDate: 'invalid',
        role: 'employee',
      }).expect(400));

    it('returns 400 for negative base salary', () =>
      createEmployee({
        name: 'invalid',
        hireDate: '2026-01-01',
        baseSalary: -500,
        role: 'employee',
      }).expect(400));

    it('returns 400 for invalid role', () =>
      createEmployee({
        name: 'invalid',
        hireDate: '2026-01-01',
        role: 'invalid',
      }).expect(400));

    it('returns 404 when supervisor not found', () =>
      createEmployee({
        name: 'invalid',
        hireDate: '2026-01-01',
        role: 'employee',
        supervisorId: 1337,
      }).expect(404));

    it('returns 400 when supervisor has employee role', () =>
      createEmployee({
        name: 'invalid',
        hireDate: '2026-01-01',
        role: 'employee',
        supervisorId: 4,
      }).expect(400));
  });

  describe('PATCH /employees/:id', () => {
    it('returns 404 when employee not found', () =>
      updateEmployee(1337, { name: 'Updated' }).expect(404));

    it('returns 400 for assigning employee as their own supervisor', () =>
      updateEmployee(1, { supervisorId: 1 }).expect(400));

    it('returns 404 when assigned supervisor does not exist', () =>
      updateEmployee(1, { supervisorId: 1337 }).expect(404));

    it('returns 400 when assigned supervisor has employee role', () =>
      updateEmployee(1, { supervisorId: 4 }).expect(400));

    it('returns 409 for demoting manager who has subordinates', () =>
      updateEmployee(1, { role: 'employee' }).expect(409));

    it('returns 409 when supervisor assignment would create a hierarchy cycle', () =>
      updateEmployee(1, { supervisorId: 3 }).expect(409));
  });

  describe('DELETE /employees/:id', () => {
    it('returns 400 for invalid ID', () => deleteEmployee('invalid').expect(400));

    it('returns 404 when deleting non-existent employee', () => deleteEmployee(1337).expect(404));
  });

  describe('CRUD', () => {
    it('creates, reads, updates, and deletes an employee', async () => {
      const manager = {
        name: 'Trump',
        hireDate: '2030-01-01',
        role: 'manager',
      };

      const createResponse = await createEmployee(manager).expect(201);

      // oxlint-disable-next-line typescript/no-unsafe-member-access
      const managerId = Number(createResponse.body.id);
      expect(managerId).toBeDefined();

      expect(createResponse.body).toEqual(
        expect.objectContaining({
          ...manager,
          baseSalary: DEFAULT_BASE_SALARY,
        }),
      );

      const getResponse = await getEmployee(managerId).expect(200);

      expect(getResponse.body).toEqual(
        expect.objectContaining({
          ...manager,
          baseSalary: DEFAULT_BASE_SALARY,
        }),
      );

      const salaryResponse = await getEmployeeSalary(managerId).expect(200);

      expect(salaryResponse.body).toEqual(
        expect.objectContaining({
          salary: DEFAULT_BASE_SALARY,
        }),
      );

      const updateResponse = await updateEmployee(managerId, { role: 'sales' }).expect(200);

      expect(updateResponse.body).toEqual(
        expect.objectContaining({
          role: 'sales',
        }),
      );

      const employee = {
        name: 'Biden',
        hireDate: '2030-01-01',
        role: 'employee',
        supervisorId: managerId,
      };

      const createEmployeeResponse = await createEmployee(employee).expect(201);

      // oxlint-disable-next-line typescript/no-unsafe-member-access
      const employeeId = Number(createEmployeeResponse.body.id);

      const salaryWithSubordinate = await getEmployeeSalary(managerId).expect(200);

      expect(salaryWithSubordinate.body).toEqual(
        expect.objectContaining({
          salary: DEFAULT_BASE_SALARY + DEFAULT_BASE_SALARY * SUBORDINATE_BONUS_RATES.sales,
        }),
      );

      await deleteEmployee(employeeId).expect(204);
      await getEmployee(employeeId).expect(404);

      await deleteEmployee(managerId).expect(204);
      await getEmployee(managerId).expect(404);
    });
  });
});
