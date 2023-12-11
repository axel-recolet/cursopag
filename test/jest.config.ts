import defaultJestConfig from '../jest.config';

const config: any = {
  ...defaultJestConfig,
  rootDir: '..',
  testRegex: '\\.e2e-spec\\.ts$',
  coverageDirectory: '../coverage-e2e',
  detectOpenHandles: true,
};

export default config;
