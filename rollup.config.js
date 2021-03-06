import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';
import pkg from './package.json';

export default [
	// browser-friendly UMD build
	{
		input: 'src/racor.js',
		output: {
			name: 'racor',
			file: pkg.browser,
      format: 'umd',
      moduleName: 'racor'
		},
		plugins: [
			babel({
				exclude: ['node_modules/**']
      }),
			resolve(),
			commonjs(),
      uglify()
		]
	},

	// CommonJS (for Node) and ES module (for bundlers) build.
	// (We could have three entries in the configuration array
	// instead of two, but it's quicker to generate multiple
	// builds from a single configuration where possible, using
	// an array for the `output` option, where we can specify 
	// `file` and `format` for each target)
	{
		input: 'src/racor.js',
		external: ['deepmerge'],
		output: [
			{ file: pkg.main, format: 'cjs' },
			// { file: pkg.module, format: 'es' }
		],
		plugins: [
			babel({
				exclude: ['node_modules/**']
      })
		]
	}
];