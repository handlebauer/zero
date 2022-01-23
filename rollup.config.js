import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

const input = 'src/index.js'

export default {
  input,
  plugins: [terser({ keep_classnames: true })],
  external: ['node:fs', 'node:path', 'node:url'],
  output: [
    { file: pkg.main, format: 'cjs' },
    { file: pkg.module, format: 'esm' },
  ],
}
