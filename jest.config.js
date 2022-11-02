module.exports = {
  preset: 'ts-jest',
  roots: ['./src', './test'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true }],
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/*'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/*'],
  transformIgnorePatterns: ['<rootDir>/node_modules/*'],
  watchPathIgnorePatterns: ['<rootDir>/node_modules/*'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/internals/mocks/fileMock.js',
    '\\.(css|less|sass|scss)$': 'identity-obj-proxy',
  },
}
