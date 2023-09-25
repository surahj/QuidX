# QuidX

## Requirements

- [Docker](https://www.docker.com/)
- [Yarn](https://yarnpkg.com/getting-started/install)

## Getting Started

### Ensure secrets are present as we have in .env.example

- Ensure you have a valid `.env` file in the root directory

### Start service containers (Redis and postgres)

```sh
$ docker compose up -d
```

### Start the server

```sh
$ yarn install
$ yarn run prisma:postgres:dbpush  # syncs the postgres with the Prisma schema
$ yarn run start:dev
```

## View postgres database

```bash
yarn run prisma:studio
```

## View the openIA documentation

```bash
http://localhost:8000/swagger
```


### Stop service containers (Redis and postgres)

```sh
$ docker compose down
```
