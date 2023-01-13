# LOG3990 - 103

## Installation

### Docker 🐋 (_Recommended_)

1. Install the dependencies with `npm ci` in `packages/client` and `packages/server`.
2. From the root directory, run `make dev`.
3. Visit [http://localhost:4200](http://localhost:4200).

#### Custom ports

If you have other projects running, make sure no ports are used. If needed, you can provide different ports to Docker.

| Variable            | Default |
| ------------------- | ------- |
| NGINX_PORT          | `80`    |
| SERVER_PORT         | `3000`  |
| CLIENT_PORT         | `4200`  |
| MONGO_EXPRESS_PORT  | `8081`  |

You can use them, for example, like this: `CLIENT_PORT=8000 make dev`. (_Note : the server port is hardcoded in the client code, changing it will most likely make the app crash_).

### Without Docker

1. Install the dependencies with `npm ci` in `packages/client` and `packages/server`.
2. Go to `packages/server`
    1. Run `cp .env.dev .env` (you only have to do this once)
3. Start the processes with `npm start` in `packages/client` and `packages/server`.
