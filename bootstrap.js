import { createRequire } from 'module';
const require = createRequire(import.meta.url);
require('ts-node').register({
  project: './tsconfig.json',
  compilerOptions: {
    module: 'ESNext',
    esModuleInterop: true,
  },
});


import('./src/app.ts').catch(err => console.error(err));