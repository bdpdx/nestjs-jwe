<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

2024.01.05 Brian Doyle:

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository with JWT + JWE support.

NestJS has a [page](https://docs.nestjs.com/recipes/passport) that documents setting up a NestJS project with passport-jwt to be able to use JSON Web Tokens.

They use the [passport-jwt](https://www.passportjs.org/packages/passport-jwt/) strategy, which uses the [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) library under the hood.

Unfortunately, jsonwebtoken does not support encrypted JWT payloads.

Fortunately, the [jose](https://github.com/panva/jose) project DOES support encrpyted JWTs!

Unfortunately, there isn't a convenient jose wrapper like passport-jose or similar so I had to write my own.

This project demonstrates a number of useful NestJS things and I intend to use it as a starter project for my own NestJS projects in the future.

In particular it demonstrates:

- Using Sequelize with MySQL
- Using ConfigService with .env files
- Signing and verifying JWTs and JWEs.
    - currently I support A256GCM, HS256, and RS256.
- Using a LoggerService
- Building a custom Passport strategy
- Using passport-local and a local strategy
- Using application-wide JWT/JWE guard or per-endpoint
- Using a @Public() decorator to bypass auth
- Using VSCode to develop a NestJS project
    - open the workspace, go to the debug tab, run it
    - breakpoints work, yay!

## Installation

```bash
$ npm install
```

then:

1. copy .env-template to .env and edit .env (.env is ignored from source control).

2. setup a mysql server somewhere so the app can write a Users table to it. create the mysql database and database user as follows:

```sql
    mysql> create database foo;
    mysql> create user 'foo_admin'@'localhost' identified by 'passord';
    mysql> grant all privileges on foo.* to 'foo_admin'@'localhost' with grant option;
    mysql> flush privileges;
```

3. update the .env DB_* fields so they point the the foo database with the correct user, etc.

4. update all other .env fields, in particular generate the various keys following instructions in .env-template.

5. set JWE_ALGORITHM based on the type of JWT you want to generate

    - A256GCM creates a JWE
    - HS256 creates a symmetric JWT
    - RS256 creates an asymmetric JWT

6. Set the default user email and password in the .env file. The app will populate the Users table with this user (id 1) when it runs the first time.

7. Run the app in dev mode as described below

8. Open a terminal and connect to the NestJS server, then issue curl commands to test things out.

```bash
# first, test the login endpoint to get a JWT or JWE:
# replace email and password with the email and password
# you used in the .env file
curl -X POST http://localhost:3000/auth/login -d '{"email": "admin@example.com", "password": "admin"}' -H "Content-Type: application/json"

# this returns something like:

{"accessToken":"eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..FklP45k-611HGziE.nwka3-HlSYXrbHH88KD4AetoOiUcVq1gUIaBidr7ySpodgYFNqnqOpOIgNqrI9hDEeO3yqhlfO5orrQ3ldyyubSW0IqkUFF5FblfOZ9pSK4ZfUp1yKSBOhNSK9Vdem003QJtV887HcL-hxXTddY.iPeGdt0Ua4Q3XC8znAxhoQ"}

# next copy the access token into a new curl command:

curl http://localhost:3000/profile -H "Authorization: Bearer eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..FklP45k-611HGziE.nwka3-HlSYXrbHH88KD4AetoOiUcVq1gUIaBidr7ySpodgYFNqnqOpOIgNqrI9hDEeO3yqhlfO5orrQ3ldyyubSW0IqkUFF5FblfOZ9pSK4ZfUp1yKSBOhNSK9Vdem003QJtV887HcL-hxXTddY.iPeGdt0Ua4Q3XC8znAxhoQ"

# If all goes well, you'll see the verified and decrypted (if JWE)
# user record:
{"email":"admin@example.com","id":1}

# now build something useful with this framework.
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
