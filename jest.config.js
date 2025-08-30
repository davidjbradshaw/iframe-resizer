export default {
  rootDir: './',
  modulePaths: ['<rootDir>'],
  moduleDirectories: ['node_modules'],
  setupFilesAfterEnv: ['./jest.setup.js'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest',
  },
  transformIgnorePatterns: ['node_modules/(?!auto-console-group/)'],
}
