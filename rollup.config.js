// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'lib/racor.js',
  output: {
    file: 'dist/bundle.js',
    format: 'umd'
  },
  plugins: [resolve()]
};
