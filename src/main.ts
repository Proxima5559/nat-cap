import { App } from "./app";
import { env } from "./config/vne";

const port = env.PORT;

new App().listen(port);
