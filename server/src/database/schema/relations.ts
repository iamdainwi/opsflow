import { defineRelations } from 'drizzle-orm';
import * as schema from './index.js';

export const relations = defineRelations(schema, (r) => ({
  users: {
    createdTickets: r.many.tickets({
      alias: 'creator',
    }),

    assignedTickets: r.many.tickets({
      alias: 'assignee',
    }),
  },

  tickets: {
    creator: r.one.users({
      from: r.tickets.createdBy,
      to: r.users.id,
      alias: 'creator',
    }),

    assignee: r.one.users({
      from: r.tickets.assigneeId,
      to: r.users.id,
      alias: 'assignee',
    }),
  },
}));
