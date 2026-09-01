'use strict';

const path =
  require('node:path');

const {
  createRuntime
} = require(
  './runtime-factory-v1'
);

const {
  createHttpServer
} = require(
  './http-server-v1'
);

const {
  LocalDryRunProviderAdapter
} = require(
  './local-dry-run-provider-adapter-v1'
);

const {
  ChatProviderDispatchBridge
} = require(
  './chat-provider-dispatch-bridge-v1'
);

async function main() {
  const projectRoot =
    path.resolve(
      __dirname,
      '..',
      '..'
    );

  const stateRoot =
    process.env.CIWU_STATE_ROOT
      ? path.resolve(
          process.env.CIWU_STATE_ROOT
        )
      : path.join(
          projectRoot,
          '.ciwu',
          'production-state'
        );

  const port =
    Number(
      process.env.PORT ||
      10000
    );

  if (
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535
  ) {
    throw new Error(
      'INVALID_PRODUCTION_PORT'
    );
  }

  process.env.CIWU_PUBLIC_HOST =
    process.env.CIWU_PUBLIC_HOST ||
    'ciwu-omni-ai-platform.onrender.com';

  const runtime =
    createRuntime({
      projectRoot,
      stateRoot,
      projectId:
        'ciwu-omega-infinity-production',
      providers: [
        {
          name: 'CIWU_DRY_RUN',
          adapter:
            new ChatProviderDispatchBridge({
              provider:
                'CIWU_DRY_RUN',
              adapter:
                new LocalDryRunProviderAdapter(),
              timeoutMs:
                5000,
              retryLimit:
                0
            }),
          metadata: {
            enabled: true,
            healthy: true,
            server_side: true,
            network: false,
            operational_authority: false
          }
        }
      ]
    });

  if (
    !runtime ||
    !runtime.api
  ) {
    throw new Error(
      'PRODUCTION_RUNTIME_API_MISSING'
    );
  }

  const server =
    createHttpServer(
      runtime.api
    );

  server.listen(
    port,
    '0.0.0.0',
    () => {
      console.log(
        'CIWU_PRODUCTION_RUNTIME=PASS'
      );
      console.log(
        'CIWU_PUBLIC_HOST=' +
        process.env.CIWU_PUBLIC_HOST
      );
      console.log(
        'CIWU_BIND_HOST=0.0.0.0'
      );
      console.log(
        'CIWU_PORT=' +
        port
      );
      console.log(
        'CIWU_EXTERNAL_PROVIDERS=0'
      );
      console.log(
        'CIWU_OPERATIONAL_AUTHORITY=0'
      );
    }
  );

  process.on(
    'SIGTERM',
    () =>
      server.close(
        () => process.exit(0)
      )
  );

  process.on(
    'SIGINT',
    () =>
      server.close(
        () => process.exit(0)
      )
  );
}

main().catch(
  error => {
    console.error(
      error &&
      error.stack
        ? error.stack
        : error
    );
    process.exit(1);
  }
);
