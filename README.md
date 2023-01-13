# LOG3990 - 103

## Installation

### Docker 🐋 (_Recommended_)

1. Install the dependencies with `npm ci` in `packages/client` and `packages/server`.
2. From the root directory, run `make dev`.
3. Visit [http://localhost:4200](http://localhost:4200).

### Without Docker

1. Install the dependencies with `npm ci` in `packages/client` and `packages/server`.
2. Go to `packages/server`
    1. Run `cp .env.dev .env` (you only have to do this once)
3. Start the processes with `npm start` in `packages/client` and `packages/server`.
