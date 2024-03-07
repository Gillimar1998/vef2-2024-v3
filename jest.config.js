export default {
    preset: 'ts-jest/presets/default-esm',
    globals: {
      'ts-jest': {
        useESM: true,
      },
    },
    transform: {
        '^.+\\.ts$': ['ts-jest', {
          useESM: true,
        }],
      },
    moduleNameMapper: {
      '^(\\.{1,2}/.*)\\.js$': '$1',
    },
    extensionsToTreatAsEsm: ['.ts'], 
    testEnvironment: 'node',
  };