"use strict";

/*
 * EONS ENGINEERING MEMORY
 *
 * Stores structured lessons from engineering runs.
 *
 * This is NOT uncontrolled self-training.
 * The system learns from explicit observations:
 *
 * - what was attempted
 * - what passed
 * - what failed
 * - why it failed
 * - what verification detected
 * - what should be repeated
 * - what should be avoided
 */

class EngineeringMemory {
  constructor() {
    this.runs = [];
  }

  record(run) {
    const entry = {
      id: `run_${Date.now()}_${this.runs.length}`,
      timestamp: new Date().toISOString(),
      objective: run.objective || null,
      result: run.result || "UNKNOWN",
      stages: Array.isArray(run.stages) ? run.stages : [],
      failures: Array.isArray(run.failures) ? run.failures : [],
      lessons: Array.isArray(run.lessons) ? run.lessons : [],
      metrics: run.metrics || {}
    };

    this.runs.push(entry);

    return entry;
  }

  recent(limit = 10) {
    return this.runs.slice(-limit);
  }

  successful(limit = 10) {
    return this.runs
      .filter(run => run.result === "PASS")
      .slice(-limit);
  }

  failed(limit = 10) {
    return this.runs
      .filter(run => run.result === "FAIL")
      .slice(-limit);
  }

  deriveLessons() {
    const lessons = [];

    for (const run of this.runs) {
      for (const lesson of run.lessons) {
        lessons.push({
          lesson,
          sourceRun: run.id
        });
      }
    }

    return lessons;
  }
}

module.exports = {
  EngineeringMemory
};
