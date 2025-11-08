# Nomie

## Check out the deployed version at https://nomie.elliottf.dk/ 

Nomie is a contextual and proactive travel buddy that helps you travel. The core idea is that Nomie would be your go to app for having an overview of what to do next. Did you just land after a long flight? Nomie will know that youre probably tired and hungry, and suggest you find a place to rest and get something to eat.

# Key features

## Context aware recommendations

Nomie constantly keeps track of the weather, local news, your location, and intelligently guesses your mood based on chat history. It constantly uses this to reason about nice places to visit or great dinner locations. This will all automatically get surfaced in the dashboard in the app, meaning Nomie always shows you ultra relevant and context aware suggestions of thigns to do.

## Pulls in context from a bunch of sources

Nomie continusly keeps up with updates from your email and fetches relevant information like flight and hotel bookings. This info will be stored for future use as context when suggesting things to do

## Your go to travel agent

Nomie is also your personal travel agent, you can text nomie questions of what to do or just let her know your travel preferences. Nomie will remember your preferences or reviews of places, and use that in the future to further personalize the recommmendations. 

# This repo

## This repository contains the backend for the Nomie app

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
