# graph-ryder-dashboard 2.0

This project was generated with the [Angular Full-Stack Generator](https://github.com/DaftMonk/generator-angular-fullstack) version 4.2.2.

## Getting Started

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js and npm](nodejs.org) Node >= 4.x.x, npm >= 2.x.x
- [Gulp](http://gulpjs.com/) (`npm install --global gulp`)
- [MongoDB](https://www.mongodb.org/) - Keep a running daemon with `mongod`
- [graph-ryder-api](https://github.com/norbertFeron/graph-ryder-api) - use matching branch and keep a running instance

### Developing

1. Run `npm install` to install server dependencies.

2. Run `mongod` in a separate shell to keep an instance of the MongoDB Daemon running

3. Run `graph-ryder-api` in a separate shell to keep an instance running

4. Run `gulp serve` to start the development server. It should automatically open the client in your browser when ready.

Please refer to the Generator [guide](https://angular-fullstack.github.io/guides/) and use yeoman cmd to create new content

## Build & development

Run `gulp build` for building and `gulp serve` for preview.

## Launch Graph-ryder full plateform

1. git clone https://github.com/norbertFeron/private-graph-ryder-dashboard.git

2. git clone https://github.com/norbertFeron/private-graph-ryder-api.git

3. mv YOUR_NEO4J_WITH_PLUGINS neo4j

4. import your server.crt and server.key in "certs" folder

4. Api config file ( in private-graph-ryder-api ):
   - cp config.example.ini config.ini
   - nano config.ini 
   - set your neo4j password
   
5. docker-compose up ( in private-graph-ryder-dashboard )
