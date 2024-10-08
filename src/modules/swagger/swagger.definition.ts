import config from '../../config/config';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Access Card API',
    version: '0.0.1',
    description: 'This is a node express mongoose boilerplate in typescript',
    license: {
      name: 'MIT',
      url: 'https://github.com/saisilinus/node-express-mongoose-typescript-boilerplate.git',
    },
  },
  servers: [
    {
      url: `${config.swaggerUrl}/v2`,
      description: 'Development Server',
    },
  ],
};

export default swaggerDefinition;
