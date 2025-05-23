import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

export const envConfig = {
    serviceEndpoint : process.env.SERVICE_ENDPOINT,
};