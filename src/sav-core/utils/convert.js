
export function convertCase (type, str) {
  switch (type) {
    case 'pascal':
      return pascalCase(str)
    case 'camel':
      return camelCase(str)
    case 'snake':
      return snakeCase(str)
    case 'hyphen':
      return hyphenCase(str)
    default:
      return str
  }
}

/**
 * Camelize a hyphen-delmited string.
 */
const camelCaseRE = /[-_](\w)/g
export function camelCase (str) {
  return lcfirst(str.replace(camelCaseRE, (_, c) => c ? c.toUpperCase() : ''))
}

/**
 * Capitalize a string.
 */
function ucfirst (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * UnCapitalize a string.
 */
function lcfirst (str) {
  return str.charAt(0).toLowerCase() + str.slice(1)
}

const replaceAZRE = /([A-Z])/g

/**
 * Hyphenate a camelCase string.
 */
export function hyphenCase (str) {
  return camelCase(str).replace(replaceAZRE, '-$1').toLowerCase()
}

export function snakeCase (str) {
  return camelCase(str).replace(replaceAZRE, '_$1').toLowerCase()
}

export function pascalCase (str) {
  return ucfirst(camelCase(str))
}
