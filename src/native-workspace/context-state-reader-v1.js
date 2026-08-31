'use strict';

const fs = require('node:fs');
const path = require('node:path');

const MAX_FILES = 500;
const MAX_FILE_BYTES =
  1024 * 1024;

function contained(
  root,
  candidate
) {
  const a =
    path.resolve(root);

  const b =
    path.resolve(candidate);

  return (
    b === a ||
    b.startsWith(
      a + path.sep
    )
  );
}

function jsonFiles(
  root,
  options = {}
) {
  const {
    exclude = [],
    maxFiles = MAX_FILES
  } = options;

  if (!fs.existsSync(root)) {
    return [];
  }

  const out = [];
  const stack = [root];

  while (
    stack.length &&
    out.length < maxFiles
  ) {
    const current =
      stack.pop();

    if (
      !contained(
        root,
        current
      )
    ) {
      throw new Error(
        'CONTEXT_STATE_PATH_ESCAPE'
      );
    }

    const stat =
      fs.lstatSync(current);

    if (
      stat.isSymbolicLink()
    ) {
      continue;
    }

    if (
      stat.isDirectory()
    ) {
      const names =
        fs.readdirSync(current)
          .sort()
          .reverse();

      for (const name of names) {
        const child =
          path.join(
            current,
            name
          );

        const relative =
          path.relative(
            root,
            child
          );

        if (
          exclude.some(
            prefix =>
              relative === prefix ||
              relative.startsWith(
                prefix + path.sep
              )
          )
        ) {
          continue;
        }

        stack.push(child);
      }

      continue;
    }

    if (
      stat.isFile() &&
      current.endsWith('.json') &&
      stat.size <=
        MAX_FILE_BYTES
    ) {
      out.push(current);
    }
  }

  return out;
}

function safeReadJson(file) {
  try {
    return JSON.parse(
      fs.readFileSync(
        file,
        'utf8'
      )
    );
  } catch (_) {
    return null;
  }
}

function flattenMessages(
  value,
  sourceFile,
  results = []
) {
  if (
    value == null ||
    results.length >= 5000
  ) {
    return results;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      flattenMessages(
        item,
        sourceFile,
        results
      );

      if (
        results.length >= 5000
      ) {
        break;
      }
    }

    return results;
  }

  if (
    typeof value !== 'object'
  ) {
    return results;
  }

  const content =
    typeof value.content ===
      'string'
      ? value.content
      : typeof value.text ===
          'string'
        ? value.text
        : null;

  if (content) {
    results.push({
      id:
        value.id ||
        value.message_id ||
        null,
      role:
        value.role ||
        (
          value.author &&
          value.author.role
        ) ||
        null,
      content,
      timestamp:
        value.timestamp ||
        value.created_at ||
        value.create_time ||
        null,
      source_file:
        sourceFile
    });
  }

  for (
    const [key,child] of
    Object.entries(value)
  ) {
    if (
      key === 'content' ||
      key === 'text'
    ) {
      continue;
    }

    flattenMessages(
      child,
      sourceFile,
      results
    );

    if (
      results.length >= 5000
    ) {
      break;
    }
  }

  return results;
}

function flattenMemory(
  value,
  sourceFile,
  results = []
) {
  if (
    value == null ||
    results.length >= 5000
  ) {
    return results;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      flattenMemory(
        item,
        sourceFile,
        results
      );

      if (
        results.length >= 5000
      ) {
        break;
      }
    }

    return results;
  }

  if (
    typeof value !== 'object'
  ) {
    return results;
  }

  const content =
    typeof value.content ===
      'string'
      ? value.content
      : typeof value.text ===
          'string'
        ? value.text
        : typeof value.value ===
            'string'
          ? value.value
          : null;

  if (content) {
    results.push({
      id:
        value.id || null,
      class:
        value.class || null,
      content,
      confidence:
        value.confidence ?? null,
      provenance:
        value.provenance || null,
      timestamp:
        value.timestamp ||
        value.created_at ||
        null,
      source_file:
        sourceFile
    });
  }

  for (
    const [key,child] of
    Object.entries(value)
  ) {
    if (
      key === 'content' ||
      key === 'text' ||
      key === 'value'
    ) {
      continue;
    }

    flattenMemory(
      child,
      sourceFile,
      results
    );

    if (
      results.length >= 5000
    ) {
      break;
    }
  }

  return results;
}

class ContextStateReader {
  constructor(stateRoot) {
    this.stateRoot =
      path.resolve(
        stateRoot
      );
  }

  nativeConversations() {
    const root =
      path.join(
        this.stateRoot,
        'conversations'
      );

    const files =
      jsonFiles(
        root,
        {
          exclude:[
            'imported-active'
          ]
        }
      );

    const rows = [];

    for (const file of files) {
      const value =
        safeReadJson(file);

      if (!value) {
        continue;
      }

      flattenMessages(
        value,
        path.relative(
          this.stateRoot,
          file
        ),
        rows
      );
    }

    return rows;
  }

  projectMemory() {
    const candidates = [
      path.join(
        this.stateRoot,
        'memory'
      ),
      path.join(
        this.stateRoot,
        'project-memory'
      )
    ];

    const rows = [];

    for (
      const root of
      candidates
    ) {
      for (
        const file of
        jsonFiles(root)
      ) {
        const value =
          safeReadJson(file);

        if (!value) {
          continue;
        }

        flattenMemory(
          value,
          path.relative(
            this.stateRoot,
            file
          ),
          rows
        );
      }
    }

    return rows;
  }
}

module.exports = {
  ContextStateReader,
  jsonFiles,
  flattenMessages,
  flattenMemory
};
