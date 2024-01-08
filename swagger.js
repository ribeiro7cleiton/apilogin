const swaggerAutogen = new require('swagger-autogen')();

const outputFile = './dist/swagger/swagger_output.json';
const endpointsFiles = ['./src/routes.js'];

const doc = {
    info: {
        version: "1.0.0",
        title: "LOGIN",
        description: "API responsável controlar os usuários das APIS da Sopasta SA"
    },
    host: "svapps:3333",
    basePath: "/",
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json']    
}

swaggerAutogen(outputFile, endpointsFiles, doc);