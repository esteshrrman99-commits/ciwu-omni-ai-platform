'use strict';

const crypto = require('node:crypto');

class ApprovalTicketStore {
  constructor() {
    this.tickets = new Map();
  }

  create(request, now) {
    if (
      !request ||
      typeof request.action !== 'string' ||
      !request.action
    ) {
      throw new Error('INVALID_APPROVAL_REQUEST');
    }

    const id =
      'approval-' +
      crypto.randomBytes(12).toString('hex');

    const ticket = {
      id,
      action: request.action,
      payload:
        request.payload &&
        typeof request.payload === 'object'
          ? request.payload
          : {},
      created_at: now,
      status: 'PENDING',
      execution_status: 'NOT_EXECUTED'
    };

    this.tickets.set(id, ticket);

    return { ...ticket };
  }

  get(id) {
    const ticket = this.tickets.get(id);
    return ticket ? { ...ticket } : null;
  }

  decide(id, decision, now) {
    const ticket = this.tickets.get(id);

    if (!ticket) {
      throw new Error('APPROVAL_NOT_FOUND');
    }

    if (ticket.status !== 'PENDING') {
      throw new Error('APPROVAL_ALREADY_DECIDED');
    }

    if (!['APPROVED', 'DENIED'].includes(decision)) {
      throw new Error('INVALID_APPROVAL_DECISION');
    }

    ticket.status = decision;
    ticket.decided_at = now;
    ticket.execution_status = 'NOT_EXECUTED';

    return { ...ticket };
  }
}

module.exports = {
  ApprovalTicketStore
};
