import { createServer } from "node:http";
import { requestHandler } from "./modules/request-handler";
import { Environment } from "./modules/environment";

const PORT = Environment.PORT;

createServer(requestHandler).listen(PORT);

console.log(`Server listening on port ${PORT}`);
console.dir(Environment);
