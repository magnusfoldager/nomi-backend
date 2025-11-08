# nomi-backend

# CHECK OUT DEPLOYED BUILD AT https://nomie.elliottf.dk/  

Backend for the Nomi(e) app

[Frontend Repository (Lovable)](https://github.com/Ell1ott/nomie-voyage-palette-15345)

Deployed on [Fly](https://nomi-backend.fly.dev/) for demo purposes.

## Quick start (local)
1. Clone repository
    ```
    git clone https://github.com/magnusfoldager/nomi-backend.git
    cd nomi-backend
    ```

2. Copy environment template and edit
    ```
    cp .env.example .env
    # Edit .env to set DB connection, secret keys, ports, etc.
    ```

3. Install dependencies
    ```
    npm install
    ```

Follow the "[Environment variables](#environment-variables-env-example)" and "[Production Build](#production-build)" sections.

## Environment variables (.env example)
Refer to the [.env.example](.env.example) file:
```
OPENAI_API_KEY=
ACI_MCP_URL=
OPENWEATHER_API_KEY=
```
Adjust keys to match the app's configuration.

- `OPENAI_API_KEY` needs to be an API key for OpenAI

- `ACI_MCP_URL` needs to be an aci.dev url with GMail authorised

- `OPENWEATHER_API_KEY` needs to be an API key for OpenWeather

## Production Build
1. Build:
    ```
    npm run build
    ```

2. Start:
    ```
    npm run start
    ```

## Development Build
To run development locally, please use Bun

```bun --hot --bun index.ts```

## Troubleshooting
- DB connection errors: verify `.env` credentials and that the DB server is running.
- Port conflicts: change PORT in `.env`.
- Dependency issues: delete `node_modules` and reinstall (`rm -rf node_modules && npm install`).

## Contributing
- Open PRs against `main`.

## License
See [LICENSE.md](LICENSE.md)
