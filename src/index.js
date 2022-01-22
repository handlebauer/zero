import { promises as fs } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const path = fileURLToPath(new URL(import.meta.url))
const currentWorkingDirectory = dirname(path)
const buildFilePath = fileName =>
  join(currentWorkingDirectory, `${fileName}.zero`)

const hoursToSeconds = hours => 1000 * 60 * 60 * hours

const encode = JSON.stringify
const decode = JSON.parse

const parseFile = path => {
  return fs
    .readFile(path)
    .then(decode)
    .catch(() => [])
}

const returnTrue = () => true
const returnFalse = () => false

export class Zero {
  static async init(fileName, options = {}) {
    const filePath = buildFilePath(fileName)
    const array = await parseFile(filePath)
    return new Zero(filePath, array, options)
  }

  constructor(filePath, array, options) {
    this.filePath = filePath
    this.store = new Map(array)
    this.ttl = options.ttl || null
  }

  get expiresAt() {
    return Date.now() + hoursToSeconds(this.ttl)
  }

  async get(key) {
    const [value, expiresAt] = this.store.get(key) || []
    const expired = Date.now() > expiresAt
    if (expired) {
      await this.delete(key)
      return undefined
    }
    return value
  }

  set(key, value) {
    const expiresAt = this.ttl && this.expiresAt
    this.store.set(key, [value, expiresAt])
    return this.save()
  }

  delete(key) {
    this.store.delete(key)
    return this.save()
  }

  clear() {
    this.store.clear()
    return this.save('').then(returnTrue).catch(returnFalse)
  }

  save(data = encode([...this.store])) {
    return fs.writeFile(this.filePath, data)
  }

  async *[Symbol.asyncIterator]() {
    for (const [key, [value, expiresAt]] of this.store) {
      if (Date.now() > expiresAt) {
        await this.delete(key)
      } else {
        yield value
      }
    }
  }
}
