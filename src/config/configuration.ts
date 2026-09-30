import { ConfigService } from "@nestjs/config";

const configuration = () => ({
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    dbHost: process.env.DB_HOST,
    dbName: process.env.DB_NAME,
    dbPort: process.env.DB_PORT,
    dbUser: process.env.DB_USERNAME,
    dbPass: process.env.DB_PASSWORD
})

export default configuration;