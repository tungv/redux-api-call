import path from 'path';
import stub from 'rollup-plugin-stub';
import alias from 'rollup-plugin-alias';
import babel from 'rollup-plugin-babel';
import multiEntry from 'rollup-plugin-multi-entry';

const tests = process.env.TESTS;
const entry = tests ? tests.split(',').map(t => `src/__tests__/${t}.spec.js`) : 'src/__tests__/*.spec.js';

export default {
  // entry: 'src/__tests__/actions.spec.js',
  entry,
  dest: '.build/tests.js',
  sourceMap: true,
  format: 'cjs',
  plugins: [
    babel({
      babelrc: false,
      presets: ['stage-1', ['es2015', { modules: false }], 'es2016'],
      plugins: ['external-helpers']
    }),
    stub(),
    multiEntry(),
  ]
};
