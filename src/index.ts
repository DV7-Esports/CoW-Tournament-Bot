(async () => {
    // Getting and validating .env file
    const EnvLoader = require('./classes/EnvLoader').default;
    EnvLoader.load();
    // Setting up moment-timezone
    const moment = require('moment-timezone');
    // Starting client
    const client = require('./client').default;
    moment.locale('en');
    moment.tz.setDefault('Europe/Sofia');
    client.login(client.config.token);
})();

(async () => {
    // Getting Express app
    const app = require("./express/src/app").default;
    
    const port = app.get("port");

    const server = app.listen(port, onListening);
    server.on("error", onError);
    
    function onError(error: NodeJS.ErrnoException) {
        if (error.syscall !== "listen") {
            throw error;
        }
    
        const bind = typeof port === "string" ? `Pipe ${port}` : `Port ${port}`;
    
        // handle specific listen errors with friendly messages
        switch (error.code) {
            case "EACCES":
                console.error(`${bind} requires elevated privileges`);
                break;
            case "EADDRINUSE":
                console.error(`${bind} is already in use`);
                break;
            default:
                throw error;
        }
    }
    
    function onListening() {
        const addr = server.address();
        const bind =
                typeof addr === "string" ? `pipe ${addr}` : `port ${addr?.port}`;
        console.log(`Listening on ${bind}`);
    }  
})();