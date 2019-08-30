import { loadTemplate, RESOLVER_DIR } from '.'
import fs = require('fs')
import path = require('path')

export async function createResolver (modelName: string): Promise<void> {
  const content = loadTemplate('resolver', { modelName })
  const fileName = modelName + '.resolver.ts'
  const filePath = path.join(RESOLVER_DIR, fileName)
  fs.writeFileSync(filePath, content, 'utf8')
}
