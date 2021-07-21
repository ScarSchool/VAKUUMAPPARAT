# VAKUUMAPPARAT - Team A
Projekt VAKUUMAPPARAT - <b>V</b>ermittlung <b>a</b>ller Instru<b>k</b>toren <b>u</b>nd Hilfes<b>u</b>chenden u<b>m</b> S<b>a</b>etmlichen <b>p</b>ädagogisch <b>p</b>rogressive <b>a</b>mbitionierte und <b>r</b>affinierte <b>A</b>ssistenz anzubie<b>t</b>en

## Teammitglieder
- Florian Eder
- Loris Tomassetti
- Daniel Tschlatscher
- Dominic Gradenegger

## Setting up the database
To run the backend you either need a local installation of MongoDB or a docker container running it. Setting up a local installation is not going to be covered here, though if you are using docker things should be simple.
- Just run `docker run --name mongodb-teama --publish 27017:27017 -d mongo`
- Once the container is running you should be good to go. If you do not have a local mongo image, docker will automatically download one and run it with the given configuration.

## Installation
1. set "vakuumappar.at" as hostname in **hosts** File 
   - hosts located at ```c:\windows\system32\drivers\etc\hosts``` (Windows)
   - hosts located at `/etc/hosts` (Linux)
   - entry in host-file: ```127.0.0.1  vakuumappar.at``` 

2. Install certificate '.\certs\htl-vil-informatik-ca-root-certificate.pem'     
3. Start with default-configuration 
    ```
    $ npm install 
    $ npm start   
    ``` 
4. Backend should be up and running now

### Alternatively: start with your own config
1. Create / modiy your [Environment with a json formatted config-file](#Config-File) or use default env-local.json

2. Start with a custom configFile ```.\environments\{yourfilenamehere}.json```
   ```
   $ nmp install
   $ npm start -- --configFile exampleConfig.json
   ```


## Tests
1. Do the environment configuration as described in [Installation](#Installation)
2. 
    ```
    $ npm install 
    $ npm test   
    // with a custom configFile
    $ npm test -- --configFile exampleConfig.json
    ``` 

## Features
- Configuration - Loader
- https support
- Database - Connector (Mongoose with MongoDB)
- Central Error Handling
- Model, Controller, Router Structure 
- Tests included (mocha, chai)
- Testdata generation included
- Simple User Management
- Simple Auth-Provider (**not for production use, security issues**)
- linted with eslint

## Documentation 
[openAPI Specification](_documentation/SYP-TeamA-VAKUUMAPPARAT-API-1.0.0-resolved.yaml)


## Config-File
Structure of Config-File
```json
{
  "name": "development-config",
  "backend": {
    "hostname": "backend.project",
    "port": 8080,
    "apiPrefix": "/api/v1"
  },
  "security": {
    "tokenExpirationTime": 300,
    "certKeyFilePath": "./certs/~.key",
    "certFilePath": "./certs/~.crt",
    "cors": {
        "origin": [
            "http://localhost:3000",
            "http://localhost:5000"
         ]
    }
  },
  "cronJobs": {
    "demandExecuteTime": 0.05, // Time in minutes
    "demandExpireTime": 0.000103148148148148148148 // Time in days
  },
  "dbSettings": {
    "databaseURL": "mongodb://localhost",
    "databaseName": "dbTeamA"
  },
  "devOptions": {
    "mockdata": false,
    "recreateDatabase": false,
    "createDefaultCategories": true,
    "createDefaultRequirements": true
  }
}
```
