'use strict';

const {
  list,
  readText,
  metadata
} = require('./file-browser-v1');

const {
  previewReplace
} = require('./edit-preview-v1');

const {
  writeText
} = require('./safe-writer-v1');

const {
  run
} = require('./execution-sandbox-v1');

function createWorkspace(root) {
  return {
    list: relative =>
      list(root, relative),

    read: relative =>
      readText(root, relative),

    metadata: relative =>
      metadata(root, relative),

    previewEdit: (relative, nextContent) =>
      previewReplace(
        root,
        relative,
        nextContent
      ),

    write: (relative, content, grants = []) =>
      writeText(
        root,
        relative,
        content,
        grants
      ),

    execute: (request, grants = []) =>
      run(
        root,
        request,
        grants
      )
  };
}

module.exports = {
  createWorkspace
};
