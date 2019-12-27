import * as path from 'path'
import * as fs from 'fs'
import { associationOptions, associationType } from './add-relation'
import { DATALOADER_DIR, INDENT } from '.'
import { importModelToContent } from './file.utils'

export function addDataloader (associateOptions: associationOptions): void {
  const content = loadDataLoaderFactory()
  const newContent = addLoaderFactory(content, associateOptions)
  const filePath = path.join(DATALOADER_DIR, 'DataLoaderFactory.ts')
  fs.writeFileSync(filePath, newContent, 'utf8')
}

// #region DataLoader
function loadDataLoaderFactory (): string {
  const filePath = path.join(DATALOADER_DIR, 'DataLoaderFactory.ts')
  const content = fs.readFileSync(filePath, 'utf8')
  return content
}

function addLoaderFactory (fileContent: string, associateOptions: associationOptions): string {
  const { type, target, modelName } = associateOptions
  const isBelongsTo = type === associationType.belongsTo
  const modelToBeImport = isBelongsTo ? target : modelName
  const withDataLoader = buildLoader(fileContent, associateOptions)
  const withImport = importModelToContent(modelToBeImport, withDataLoader)
  return withImport
}

function buildLoader (fileContent: string, associateOptions: associationOptions): string {
  const regex = /(?<= {2}return \{)(.|\s)*?(?= {2}\})/
  const [oldDataloderContent] = fileContent.match(regex) || ['']
  const dataLoaderObject = buildLoaderObject(associateOptions)
  const newAssociationContent = `\n${INDENT}${INDENT}${dataLoaderObject},${oldDataloderContent}`
  return fileContent.replace(regex, newAssociationContent)
}

function buildLoaderObject ({ type, target, modelName }: associationOptions): string {
  const modelNameLowerCase = modelName.toLocaleLowerCase()
  switch (type) {
    case associationType.belongsTo:
      return `${modelNameLowerCase}${target}: new DataLoader(makeBatchBelongsTo(${modelName}.associations.${target}, dataLoaderOptions))`

    case associationType.hasOne:
      return `${modelNameLowerCase}${target}: new DataLoader(makeBatchHasOne(${modelName}.associations.${target}, dataLoaderOptions))`

    case associationType.hasMany:
      return `${modelNameLowerCase}${target}s: new DataLoader(makeBatchHasMany(${modelName}.associations.${target}s, dataLoaderOptions)`
  }

  throw new Error('Invalid parameter')
}
// #endregion
