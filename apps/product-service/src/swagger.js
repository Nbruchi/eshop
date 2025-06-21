import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Product Service API',
    description: 'Documentation for the Product Service API',
    version: '1.0.0',
  },
  host: 'localhost:6002',
  schemes: ['http'],
  basePath: '/products',
};

const outputFile = './swagger-output.json';

const endpointsFiles = ['./product.routes.ts'];

swaggerAutogen()(outputFile, endpointsFiles, doc);
