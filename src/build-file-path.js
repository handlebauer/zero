import { accessSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const getCwd = () => {
  const path = fileURLToPath(new URL(import.meta.url))
  return dirname(path)
}

const cwd = getCwd()

const findRoot = (target = 'package.json') => {
  const findUp = directory => {
    try {
      accessSync(join(directory, target))
      return directory
    } catch {}

    if (directory === '/') {
      return undefined
    }

    const parent = dirname(directory)
    return findUp(parent)
  }

  // We first need to find @hbauer/zero's `package.json`
  const self = findUp(cwd)
  // Then, search upwards from the parent directory...
  const parent = dirname(self)
  // ... before returning the result
  return findUp(parent)
}

export const buildFilePath = fileName =>
  join(findRoot() || cwd, `${fileName}.zero`)
