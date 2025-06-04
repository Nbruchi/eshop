import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Auth Service API',
    description: 'Documentation for the Auth Service API',
    version: '1.0.0',
  },
  host: 'localhost:6001',
  schemes: ['http'],
  basePath: '/api/auth',
};

const outputFile = './swagger-output.json';

const endpointsFiles = ['./routes/auth.routes.ts'];

swaggerAutogen()(outputFile, endpointsFiles, doc);
