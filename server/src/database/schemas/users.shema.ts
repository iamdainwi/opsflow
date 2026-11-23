import {
  varchar,
  timestamp,
  mysqlEnum,
  mysqlTable,
} from 'drizzle-orm/mysql-core';
import { createId } from '@paralleldrive/cuid2';

export const users = mysqlTable('users', {
  id: varchar({ length: 256 })
    .$defaultFn(() => createId())
    .primaryKey(),
  name: varchar({ length: 256 }).notNull(),
  email: varchar({ length: 256 }).notNull().unique(),
  password: varchar({ length: 256 }).notNull(),
  roles: mysqlEnum(['employee', 'manager', 'admin']).default('employee'),
  created_at: timestamp().defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
