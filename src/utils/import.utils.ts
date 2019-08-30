import * as path from 'path'

interface ImportSafeEslintReturn {
  [index: string]: any
}

export function importSafeEslint (rootDir: string, file: string): ImportSafeEslintReturn {
  return require(path.join(rootDir, file))
}
