import path from 'path';
import alias from 'rollup-plugin-alias';
import async from 'rollup-plugin-async';
import buble from 'rollup-plugin-buble';
import multiEntry from 'rollup-plugin-multi-entry';

const tests = process.env.TESTS;
const entry = tests ? tests.split(',').map(t => `src/__tests__/${t}.spec.js`) : 'src/__tests__/*.spec.js';

export default {
  entry,
  dest: '.build/tests.js',
  format: 'cjs',
  plugins: [
    async(),
    multiEntry(),
    buble({
      objectAssign: 'Object.assign',
      transforms: {
        generator: false,
      }
    }),
    alias({
      'redux-api-call': path.resolve('./src/index.js'),
    }),
  ]
};
