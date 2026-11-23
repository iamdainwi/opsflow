import {
  text,
  varchar,
  timestamp,
  mysqlTable,
  mysqlEnum,
} from 'drizzle-orm/mysql-core';
import { createId } from '@paralleldrive/cuid2';
import { users } from './users.schema.js';

export const tickets = mysqlTable('tickets', {
  id: varchar({ length: 256 })
    .$defaultFn(() => createId())
    .primaryKey()
    .notNull(),
  title: varchar({ length: 256 }).notNull(),
  description: text(),
  category: mysqlEnum(['IT_ACCESS', 'INFRASTRUCTURE', 'PROCUREMENT'])
    .default('IT_ACCESS')
    .notNull(),
  priority: mysqlEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .default('MEDIUM')
    .notNull(),
  status: mysqlEnum(['OPEN', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'CLOSED'])
    .default('OPEN')
    .notNull(),
  createdBy: varchar('created_by', { length: 256 })
    .references(() => users.id)
    .notNull(),
  assigneeId: varchar('assignee_id', { length: 256 }).references(
    () => users.id,
  ),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull().onUpdateNow(),
});
