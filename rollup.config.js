import { terser } from 'rollup-plugin-terser'
import analyze from 'rollup-plugin-analyzer'
import pkg from './package.json'

const input = 'src/index.js'

const core = ['node:fs', 'node:path']
const external = [...core, ...Object.keys(pkg.dependencies)]

export default [
  {
    input,
    external,
    output: { file: pkg.main, format: 'cjs' },
    plugins: [terser({ keep_classnames: true, keep_fnames: true }), analyze()],
  },
  {
    input,
    external,
    output: { file: pkg.module, format: 'esm' },
    plugins: [terser({ keep_classnames: true, keep_fnames: true }), analyze()],
  },
]
