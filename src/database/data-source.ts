import { config } from "dotenv";
import { DataSource } from "typeorm";
import { Task } from "../tasks/entity/task.entity.js";
import { configSchema } from "../config/configuration.js";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const environmentType:string = process.env.NODE_ENV ?? 'development';

if(environmentType !== 'production'){
    config({
        path: environmentType === 'test' ? '.env.test' : '.env'
    });
};

const env = configSchema.parse(process.env); // use schema from Zod for configSchema and make sure process the schema with environment vars

const currentFileURL = fileURLToPath(import.meta.url); // import.meta.url get the url of the current file (i.e. file:///C:/User/DevSecOps/src/database/data-source.ts). fileUrltoPath change the url to filename system (i.e. C:\User\DevSecOps\src\database\data-source.ts)
const currentDir = dirname(currentFileURL); // Get the dir of the current file, basically something like ../ (i.e. C:\User\DevSecOps\src\database)

export default new DataSource({
    type: 'postgres',
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,

    entities: [Task],
    
    synchronize: false,
    migrations: [path.join(currentDir, '../migration/*{.js,.ts}')] // We use ../ so that it change from /src/database/migration to /src/migration. We do migration/*{.js,.ts} means /src/migration/128000000-Change-01.js
})