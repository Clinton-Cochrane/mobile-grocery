module.exports = {
  root: true,
  extends: '@react-native-community',
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: false,
    babelOptions: {
      presets: ['module:metro-react-native-babel-preset'],
    },
  },
  env: {
    'jest/globals': true,
  },
  plugins: ['jest'],
  rules: {
    // custom rules here
  },
};
