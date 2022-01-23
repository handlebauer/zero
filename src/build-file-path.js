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

  return findUp(cwd)
}

export const buildFilePath = fileName =>
  join(findRoot() || cwd, `${fileName}.zero`)
