'use strict';

const http = require('node:http');

const {
  sendJson,
  readJson
} = require('./http-json-v1');

const {
  normalizeError
} = require('./api-error-v1');

const {
  html
} = require('./ui-shell-v1');

const {
  assertLoopbackOrigin
} = require('./http-origin-guard-v1');

function createHttpServer(api) {
  return http.createServer(
    async (req, res) => {
      try {
        assertLoopbackOrigin(req);

        const url =
          new URL(
            req.url,
            'http://127.0.0.1'
          );

        // CIWU_STATIC_LOGO_ROUTE_V1
        if (
          req.method === 'GET' &&
          url.pathname ===
            '/brand/ciwu-omega-infinity-logo.png'
        ) {
          const fs =
            require('node:fs');

          const path =
            require('node:path');

          const logoPath =
            path.join(
              process.cwd(),
              'public',
              'brand',
              'ciwu-omega-infinity-logo.png'
            );

          const body =
            fs.readFileSync(
              logoPath
            );

          res.writeHead(200, {
            'content-type':
              'image/png',
            'content-length':
              body.length,
            'cache-control':
              'public, max-age=3600',
            'x-content-type-options':
              'nosniff'
          });

          res.end(body);
          return;
        }

        if (
          req.method === 'GET' &&
          url.pathname === '/'
        ) {
          const body = html();

          res.writeHead(200, {
            'content-type':
              'text/html; charset=utf-8',
            'content-length':
              Buffer.byteLength(body),
            'cache-control':
              'no-store',
            'x-content-type-options':
              'nosniff'
          });

          res.end(body);
          return;
        }

        if (
          req.method === 'GET' &&
          url.pathname ===
            '/api/health'
        ) {
          sendJson(
            res,
            200,
            await api.health()
          );
          return;
        }

        if (
          req.method === 'GET' &&
          url.pathname ===
            '/api/workspace/list'
        ) {
          sendJson(
            res,
            200,
            await api.workspaceList(
              url.searchParams.get(
                'path'
              ) || '.'
            )
          );
          return;
        }

        if (
          req.method === 'GET' &&
          url.pathname ===
            '/api/workspace/read'
        ) {
          sendJson(
            res,
            200,
            await api.workspaceRead(
              url.searchParams.get(
                'path'
              ) || ''
            )
          );
          return;
        }

        if (
          req.method === 'POST' &&
          url.pathname ===
            '/api/workspace/preview'
        ) {
          const body =
            await readJson(req);

          sendJson(
            res,
            200,
            await api.editPreview(
              body.path,
              body.content
            )
          );
          return;
        }

        if (
          req.method === 'GET' &&
          url.pathname ===
            '/api/memory'
        ) {
          sendJson(
            res,
            200,
            await api.memory(
              url.searchParams.get(
                'q'
              ) || ''
            )
          );
          return;
        }

        if (
          req.method === 'POST' &&
          url.pathname ===
            '/api/chat'
        ) {
          sendJson(
            res,
            200,
            await api.chat(
              await readJson(req)
            )
          );
          return;
        }

        if (
          req.method === 'POST' &&
          url.pathname ===
            '/api/approvals'
        ) {
          sendJson(
            res,
            200,
            await api.requestApproval(
              await readJson(req)
            )
          );
          return;
        }

        let match =
          url.pathname.match(
            /^\/api\/approvals\/([^/]+)\/decision$/
          );

        if (
          req.method === 'POST' &&
          match
        ) {
          const body =
            await readJson(req);

          sendJson(
            res,
            200,
            await api.decideApproval(
              decodeURIComponent(
                match[1]
              ),
              body.decision
            )
          );
          return;
        }

        match =
          url.pathname.match(
            /^\/api\/transactions\/([^/]+)\/execute$/
          );

        if (
          req.method === 'POST' &&
          match
        ) {
          const body =
            await readJson(req);

          sendJson(
            res,
            200,
            await api.executeApproved(
              decodeURIComponent(
                match[1]
              ),
              body
            )
          );
          return;
        }

        if (
          req.method === 'POST' &&
          url.pathname ===
            '/api/imports/stage'
        ) {
          sendJson(
            res,
            200,
            await api.stageImport(
              await readJson(req)
            )
          );
          return;
        }

        match =
          url.pathname.match(
            /^\/api\/imports\/([a-f0-9]{64})\/activate$/
          );

        if (
          req.method === 'POST' &&
          match
        ) {
          sendJson(
            res,
            200,
            await api.activateImport(
              match[1]
            )
          );
          return;
        }

        match =
          url.pathname.match(
            /^\/api\/imports\/([a-f0-9]{64})\/activation$/
          );

        if (
          req.method === 'GET' &&
          match
        ) {
          sendJson(
            res,
            200,
            await api.importActivationStatus(
              match[1]
            )
          );
          return;
        }

        if (
          req.method === 'POST' &&
          url.pathname ===
            '/api/provider/dispatch'
        ) {
          sendJson(
            res,
            200,
            await api.providerDispatch(
              await readJson(req)
            )
          );
          return;
        }

        if (
          req.method === 'POST' &&
          url.pathname ===
            '/api/provider/policy'
        ) {
          sendJson(
            res,
            200,
            await api.providerPolicy(
              await readJson(req)
            )
          );
          return;
        }

        if (
          req.method === 'POST' &&
          url.pathname ===
            '/api/model/dry-run'
        ) {
          sendJson(
            res,
            200,
            await api.modelDryRun(
              await readJson(req)
            )
          );
          return;
        }

        if (
          req.method === 'POST' &&
          url.pathname ===
            '/api/context/assemble'
        ) {
          sendJson(
            res,
            200,
            await api.assembleContext(
              await readJson(req)
            )
          );
          return;
        }

        if (
          req.method === 'POST' &&
          url.pathname ===
            '/api/context/search'
        ) {
          sendJson(
            res,
            200,
            await api.searchUnifiedContext(
              await readJson(req)
            )
          );
          return;
        }

        if (
          req.method === 'POST' &&
          url.pathname ===
            '/api/imports/search'
        ) {
          sendJson(
            res,
            200,
            await api.searchImportedHistory(
              await readJson(req)
            )
          );
          return;
        }

        match =
          url.pathname.match(
            /^\/api\/imports\/([a-f0-9]{64})$/
          );

        if (
          req.method === 'GET' &&
          match
        ) {
          sendJson(
            res,
            200,
            await api.getImport(
              match[1]
            )
          );
          return;
        }

        match =
          url.pathname.match(
            /^\/api\/recovery\/([^/]+)$/
          );

        if (
          req.method === 'GET' &&
          match
        ) {
          sendJson(
            res,
            200,
            await api.recoveryStatus(
              decodeURIComponent(
                match[1]
              )
            )
          );
          return;
        }

        match =
          url.pathname.match(
            /^\/api\/recovery\/([^/]+)\/resolve$/
          );

        if (
          req.method === 'POST' &&
          match
        ) {
          sendJson(
            res,
            200,
            await api.resolveRecovery(
              decodeURIComponent(
                match[1]
              ),
              await readJson(req)
            )
          );
          return;
        }

        if (
          req.method === 'GET' &&
          url.pathname ===
            '/api/audit'
        ) {
          sendJson(
            res,
            200,
            await api.auditStatus()
          );
          return;
        }

        sendJson(
          res,
          404,
          {
            ok:false,
            error:{
              code:'NOT_FOUND'
            }
          }
        );
      } catch (error) {
        const message =
          error &&
          error.message
            ? error.message
            : '';

        if (
          [
            'CROSS_SITE_REQUEST_BLOCKED',
            'FOREIGN_ORIGIN_BLOCKED',
            'INVALID_ORIGIN'
          ].includes(message)
        ) {
          sendJson(
            res,
            403,
            {
              ok:false,
              error:{
                code:message
              }
            }
          );
          return;
        }

        const normalized =
          normalizeError(error);

        sendJson(
          res,
          normalized.status,
          normalized.body
        );
      }
    }
  );
}

function listenLoopback(
  server,
  port = 0
) {
  return new Promise(
    (resolve, reject) => {
      server.once(
        'error',
        reject
      );

      server.listen(
        port,
        '127.0.0.1',
        () => {
          server.removeListener(
            'error',
            reject
          );

          resolve(
            server.address()
          );
        }
      );
    }
  );
}

module.exports = {
  createHttpServer,
  listenLoopback
};
