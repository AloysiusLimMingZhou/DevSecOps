import { config } from "dotenv";
import { DataSource } from "typeorm";
import { Task } from "../tasks/entity/task.entity.js";
import { configSchema } from "../config/configuration.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const environmentType:string = process.env.NODE_ENV ?? 'development'; // Fetch the node environment type .env, by default set as dev

if(environmentType !== 'production'){ // Since we set as NODE_ENV=test in package.json for tests, the environment type will not use dev config (.env), but rather .env.test
    config({
        path: environmentType === 'test' ? '.env.test' : '.env'
    });
};

const env = configSchema.parse(process.env); // use schema from Zod for configSchema and make sure process the schema with environment vars

const currentFileURL = fileURLToPath(import.meta.url); // import.meta.url get the url of the current file (i.e. file:///C:/User/DevSecOps/src/database/data-source.ts). fileUrltoPath change the url to filename system (i.e. C:\User\DevSecOps\src\database\data-source.ts)
const currentDir = dirname(currentFileURL); // Get the dir of the current file, basically something like ../ (i.e. C:\User\DevSecOps\src\database)

export default new DataSource({ // Config database details into DataSource, which is TypeORM CLI for migration & finding the database.
    type: 'postgres',
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,

    entities: [Task],
    
    synchronize: false, // Synchronize false make sure typeorm won't change database details even if entity change, migration stays as source of truth
    migrations: [path.join(currentDir, '../migration/*{.js,.ts}')] // We use ../ so that it change from /src/database/migration to /src/migration. We do migration/*{.js,.ts} means /src/migration/128000000-Change-01.js
})