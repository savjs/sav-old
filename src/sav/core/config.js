import {isArray, isObject} from '../util'

export class Config {
  constructor (data) {
    this._data = isObject(data) ? data : {}
  }
  has (key) {
    return key in this._data
  }
  get (key, defaultValue = null) {
    return key in this._data ? this._data[key] : defaultValue
  }
  toJSON () {
    return this._data
  }
  set (key, value = null) {
    if (isObject(key)) {
      this._data = Object.assign(this._data, key)
    } else {
      this._data[key] = value
    }
  }
  prepend (key, value) {
    isArray(this._data[key]) || (this._data[key] = [])
    this._data[key].unshift(value)
  }
  append (key, value) {
    isArray(this._data[key]) || (this._data[key] = [])
    this._data[key].push(value)
  }
  env (key, defaultValue = null) {
    if (key in process.env) {
      return process.env[key]
    }
    return this.get(key, defaultValue)
  }
  get prod () {
    return this.env('NODE_ENV') === 'production'
  }
}
