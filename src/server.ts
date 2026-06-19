import { createServer } from "node:http";
import { requestHandler } from "./modules/request-handler";

const PORT = process.env.PORT ?? 3000;

createServer(requestHandler).listen(PORT);

console.log(`Server listening on port ${PORT}`);
