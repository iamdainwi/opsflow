import { varchar } from 'drizzle-orm/mssql-core';
import { int, mysqlEnum, mysqlTable } from 'drizzle-orm/mysql-core';
import { createId } from '@paralleldrive/cuid2';

export const users = mysqlTable('users', {
  id: varchar({ length: 128 })
    .$defaultFn(() => createId())
    .primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  roles: mysqlEnum(['employee', 'manager', 'admin']).default('employee'),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
