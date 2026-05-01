/**
 * Simple Swagger/OpenAPI Documentation
 */

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Inventory API',
    version: '1.0.0',
    description: 'Simple inventory management system'
  },
  servers: [{ url: 'http://localhost:3000/api', description: 'Dev' }],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register',
        responses: { 201: { description: 'OK' } }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        responses: { 200: { description: 'OK' } }
      }
    },
    '/products': {
      get: {
        tags: ['Products'],
        summary: 'Get products',
        responses: { 200: { description: 'OK' } }
      },
      post: {
        tags: ['Products'],
        summary: 'Create product',
        responses: { 201: { description: 'OK' } }
      }
    },
    '/categories': {
      get: {
        tags: ['Categories'],
        summary: 'Get categories',
        responses: { 200: { description: 'OK' } }
      },
      post: {
        tags: ['Categories'],
        summary: 'Create category',
        responses: { 201: { description: 'OK' } }
      }
    }
  }
};

export default swaggerDefinition;
