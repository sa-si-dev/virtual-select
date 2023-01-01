import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    testIsolation: false,
    baseUrl: 'http://localhost:3001/#/',
  },
});
