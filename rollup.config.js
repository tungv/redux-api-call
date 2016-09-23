import buble from 'rollup-plugin-buble';
import strip from 'rollup-plugin-strip';
import uglify from 'rollup-plugin-uglify';

export default {
  entry: 'src/index.js',
  dest: '.build/index.js',
  format: 'cjs',
  plugins: [
    buble({
      objectAssign: 'Object.assign'
    }),
    strip({
      debugger: true,
      functions: [ 'console.*', 'assert.*', 'debug', 'alert' ],
    })
  ]
};
