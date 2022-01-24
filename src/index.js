import { join } from 'node:path'
import { openSync, readFileSync, writeFileSync } from 'node:fs'
import { h } from '@hbauer/to-milliseconds'
import { findPackageDir } from '@hbauer/find-package-dir'

const encode = JSON.stringify
const decode = JSON.parse

const parseFile = path => {
  openSync(path, 'a')
  const buffer = readFileSync(path)
  return buffer.length ? decode(buffer) : []
}

const returnTrue = () => true
const returnFalse = () => false

export class Zero {
  static init(fileName, options = {}) {
    const filePath = join(findPackageDir(), `${fileName}`)
    const array = parseFile(filePath)
    return new Zero(filePath, array, options)
  }

  constructor(filePath, array, options) {
    this.filePath = filePath
    this.store = new Map(array)
    this.ttl = options.ttl || null
  }

  get expiresAt() {
    return Date.now() + (this.ttl * h) / 1000
  }

  get(key) {
    const [value, expiresAt] = this.store.get(key) || []
    if (expiresAt > Date.now()) {
      return value
    }
    return this.delete(key)
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
    return writeFileSync(this.filePath, data)
  }

  *[Symbol.iterator]() {
    for (const [key, [value, expiresAt]] of this.store) {
      if (Date.now() > expiresAt) {
        this.delete(key)
      } else {
        yield [key, value]
      }
    }
  }
}
