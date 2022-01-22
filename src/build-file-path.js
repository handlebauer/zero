import { promises as fs } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const getCwd = () => {
  const path = fileURLToPath(new URL(import.meta.url))
  return dirname(path)
}

const findRoot = (target = 'package.json') => {
  const cwd = getCwd()

  const findUp = async directory => {
    try {
      await fs.access(join(directory, target))
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

export const buildFilePath = async fileName =>
  join((await findRoot()) || getCwd(), `${fileName}.zero`)
