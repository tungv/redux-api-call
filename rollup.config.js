import babel from 'rollup-plugin-babel';
import strip from 'rollup-plugin-strip';
import uglify from 'rollup-plugin-uglify';
import cleanup from 'rollup-plugin-cleanup';

export default {
  entry: 'src/index.js',
  dest: '.build/index.js',
  format: 'cjs',
  plugins: [
    babel({
      babelrc: false,
      presets: ['stage-1', ['es2015', { modules: false }], 'es2016'],
      plugins: ['external-helpers']
    }),
    cleanup({ maxEmptyLines: 1 }),
  ]
};
