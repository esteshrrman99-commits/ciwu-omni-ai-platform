'use strict';

const crypto = require('crypto');
const {
  classifyTruth,
  evidenceScore
} = require('./truth-lattice');

class ClaimLedger {
  constructor() {
    this.sessions = new Map();
  }

  _claims(sessionId) {
    const id = String(sessionId || 'default');

    if (!this.sessions.has(id)) {
      this.sessions.set(id, []);
    }

    return this.sessions.get(id);
  }

  add(sessionId, claim = {}) {
    const claims = this._claims(sessionId);
    const now = new Date().toISOString();

    const rec = {
      id: crypto.randomUUID(),
      subject: String(claim.subject || '').trim(),
      predicate: String(claim.predicate || '').trim(),
      value: claim.value,
      sourceClass: claim.sourceClass || 'UNKNOWN',
      verified: Boolean(claim.verified),
      patientSpecific: Boolean(claim.patientSpecific),
      provenance: claim.provenance || null,
      corroboration: Number(claim.corroboration || 0),
      createdAt: now,
      updatedAt: now,
      status: 'ACTIVE',
      conflictState: 'NONE'
    };

    for (const old of claims.filter(item =>
      item.status === 'ACTIVE' &&
      item.subject === rec.subject &&
      item.predicate === rec.predicate &&
      JSON.stringify(item.value) !== JSON.stringify(rec.value)
    )) {
      old.status = 'SUPERSEDED';
      old.conflictState = 'RESOLVED_BY_NEWER_CLAIM';
      old.updatedAt = now;
      old.truthState = 'SUPERSEDED';
    }

    rec.evidenceScore = evidenceScore(rec);
    rec.truthState = classifyTruth(rec);

    claims.push(rec);
    return rec;
  }

  list(sessionId, { activeOnly = false } = {}) {
    const rows = this._claims(sessionId);
    return activeOnly
      ? rows.filter(item => item.status === 'ACTIVE')
      : rows;
  }

  contextGraph(sessionId) {
    const active = this.list(
      sessionId,
      { activeOnly: true }
    );

    const nodes = new Map();
    const edges = [];

    for (const claim of active) {
      if (!nodes.has(claim.subject)) {
        nodes.set(claim.subject, {
          id: claim.subject,
          type: claim.patientSpecific
            ? 'PATIENT_CONTEXT'
            : 'CONCEPT'
        });
      }

      const objectId =
        `${claim.predicate}:${JSON.stringify(claim.value)}`;

      if (!nodes.has(objectId)) {
        nodes.set(objectId, {
          id: objectId,
          type: 'VALUE',
          value: claim.value
        });
      }

      edges.push({
        from: claim.subject,
        to: objectId,
        predicate: claim.predicate,
        truthState: claim.truthState,
        evidenceScore: claim.evidenceScore,
        provenance: claim.provenance
      });
    }

    return {
      nodes: [...nodes.values()],
      edges
    };
  }

  clear(sessionId) {
    this.sessions.delete(
      String(sessionId || 'default')
    );
  }
}

module.exports = new ClaimLedger();
