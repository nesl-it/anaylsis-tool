import errorHandler from "errorhandler";
import app from "./app";

app.use(errorHandler());

const PORT = app.get("port");
const ENV_MODE = app.get("env");
const server = app.listen(PORT, () => {
    console.log(`\nServer running at http://localhost:${PORT} in ${ENV_MODE} mode`);
    console.log("Press CTRL-C to stop\n");
});

export default server;
