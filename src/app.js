import express from "express";
import routes from "./routes";

const swaggerUi = new require('swagger-ui-express');
const swaggerFile = new require('./swagger/swagger_output.json');

class App {
    constructor() {
        this.server = express();

        this.middlewares();
        this.routes();
    }

    middlewares() {
        this.server.use(express.json());
    }

    routes() {
        this.server.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
        this.server.use(routes);
    }
}

export default new App().server;
