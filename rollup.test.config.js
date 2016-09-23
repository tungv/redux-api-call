import multiEntry from 'rollup-plugin-multi-entry';
import buble from 'rollup-plugin-buble';
import alias from 'rollup-plugin-alias';
import path from 'path';

const tests = process.env.TESTS;
const entry = tests ? tests.split(',').map(t => `src/__test__/${t}.js`) : 'src/__test__/*.js';

export default {
  entry,
  dest: '.build/tests.js',
  format: 'cjs',
  plugins: [
    multiEntry(),
    buble(),
    alias({
      'redux-api-call': path.resolve('./src/index.js'),
    }),
  ]
};
