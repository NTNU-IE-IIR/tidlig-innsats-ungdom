<h3 align="center">tidlig-innsats-ungdom</h3>
<p align="center">A prototype app with the goal of enhancing the health service offered to youths through knowledge sharing.</p>

## Useful resources
- [Figma]()
- [Use cases]()
- [User stories]()
- [ER diagram](docs/erdiagram.drawio.svg)

## Getting started

tbd.

## Development

### Prerequisites

- [Node.js](https://nodejs.org/en/) (LTS)
- [PNPM](https://pnpm.js.org/en/installation) (latest)
- [Docker](https://docs.docker.com/get-docker/) (for running the stack or database locally)

### Developing locally

1. Clone the repository
2. Define environment variables in a `.env` file, take a look at the `.env.example` file for reference
3. Start the docker containers with `docker compose up -d`
2. Run `pnpm install` to install dependencies
3. Change directory to the app you want to run
4. Run `pnpm dev` to start the app
