import { terser } from 'rollup-plugin-terser'
import pkg from './package.json'

const input = 'src/index.js'

const core = ['node:fs', 'node:path']
const external = [...core, ...Object.keys(pkg.dependencies)]

export default {
  input,
  external,
  output: [
    { file: pkg.main, format: 'cjs' },
    { file: pkg.module, format: 'esm' },
  ],
  plugins: [terser({ keep_classnames: true })],
}
