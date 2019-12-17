import { SCHEMA_DIR, MODEL_DIR, ROOT_TEMPLATE_DIR, RESOLVER_DIR } from 'cli'
import path = require('path')
import fs = require('fs')

/**
 * Load model file by name
 * @example
 * const contentString = loadModel('User') //Load file named User.model.ts
 * console.log(contentString) //Returns the content as string
 *
 * @param modelName File name
 * @returns {string} Content of file
 */
export function loadModel (modelName: string): string {
  const filePath = path.join(MODEL_DIR, modelName + '.model.ts')
  const content = fs.readFileSync(filePath, 'utf8')
  return content
}

/**
 * Load schema file by name, like `loadModel`
 * @param modelName File name
 * @returns {string} Content of file
 */
export function loadSchema (modelName: string): string {
  const filePath = path.join(SCHEMA_DIR, modelName + '.schema.ts')
  const content = fs.readFileSync(filePath, 'utf8')
  return content
}

export function replaceModelFile (modelName: string, newContent: string): void{
  const filePath = path.join(MODEL_DIR, modelName + '.model.ts')
  fs.writeFileSync(filePath, newContent, 'utf8')
}

export function loadAllModelsName (): string[] {
  return fs.readdirSync(MODEL_DIR, 'utf8')
    .filter(model => model !== 'index.ts' && (model.indexOf('.') !== 0))
    .map(model => model.slice(0, model.length - 9))
}

export function importModelToContent (modelName: string, fileContent: string): string {
  const importText = `import ${modelName} from 'model/${modelName}.model'`
  const alreadyImported = fileContent.indexOf(importText) !== -1
  if (alreadyImported) {
    return fileContent
  }
  const newContentWithImport = importText + '\n' + fileContent
  return newContentWithImport
}

export function loadTemplate (templateName, params: { [index: string]: string }): string {
  const templatePath = path.join(ROOT_TEMPLATE_DIR, templateName)
  let content = fs.readFileSync(templatePath, 'utf8')
  Object.entries(params)
    .forEach(([key, value]) => {
      var re = new RegExp(`{{${key}}}`, 'g')
      content = content.replace(re, value)
    })
  return content
}

export function loadResolver (modelName: string): string | undefined {
  const filePath = path.join(RESOLVER_DIR, modelName + '.resolver.ts')
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8')
    return content
  }
  console.error(`File not exists: ${filePath}`)
}
