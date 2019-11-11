import * as path from 'path'
import * as fs from 'fs'
import { associationOptions } from './add-relation'
import { DATALOADER_DIR, INDENT, importModelToContent } from '.'

export function addDataloader (associateOptions: associationOptions): void {
  if (associateOptions.schema.type) {
    // updateDataLoaderInterface(associateOptions)
    updateDataLoader(associateOptions)
  }
}

// #region DataLoader
function updateDataLoader (associateOptions: associationOptions): void {
  const content = loadDataLoaderFactory()
  const newContent = addLoaderFactory(content, associateOptions)
  const filePath = path.join(DATALOADER_DIR, 'DataLoaderFactory.ts')
  fs.writeFileSync(filePath, newContent, 'utf8')
}

function loadDataLoaderFactory (): string {
  const filePath = path.join(DATALOADER_DIR, 'DataLoaderFactory.ts')
  const content = fs.readFileSync(filePath, 'utf8')
  return content
}

function addLoaderFactory (fileContent: string, associateOptions: associationOptions): string {
  const { type, target, modelName } = associateOptions
  const isBelongsTo = type.toUpperCase() === 'belongsto'
  const modelToBeImport = isBelongsTo ? target : modelName
  const withDataLoader = buildLoaderMethod(fileContent, associateOptions)
  const withImport = importModelToContent(modelToBeImport, withDataLoader)
  return withImport
}

function buildLoaderMethod (fileContent: string, associateOptions: associationOptions): string {
  const { modelName, target } = associateOptions
  const regex = /(?<= {2}return \{)(.|\s)*?(?= {2}\})/
  const [oldDataloderContent] = fileContent.match(regex) || ['']
  const dataLoaderMethod = buildLoaderFunction(associateOptions)
  const modelNameLowerCase = modelName.toLocaleLowerCase()
  const loaderName = `${modelNameLowerCase}${target}Loader`
  const newDataLoader = `${loaderName}: ${dataLoaderMethod}`
  const newAssociationContent = `\n${INDENT}${INDENT}${newDataLoader},${oldDataloderContent}`
  return fileContent.replace(regex, newAssociationContent)
}

function buildLoaderFunction ({ type, target, modelName }: associationOptions): string | undefined {
  switch (type.toLocaleLowerCase()) {
    case 'belongsto':
      return `() => makeDataLoader(${target})`

    case 'hasone':
      return `() => makeDataLoaderHasOne(${modelName}.associations.${target})`

    case 'hasmany':
      return `() => makeDataLoaderHasMany(${modelName}.associations.${target}s)`
  }

  throw new Error('Invalid parameter')
}
// #endregion

// #region DataLoaderInterface
// function updateDataLoaderInterface (associateOptions: associationOptions): void {
//   const content = loadDataLoaderInterface()
//   const newContent = addLoaderFactoryInterface(content, associateOptions)
//   const filePath = path.join(INTERFACE_DIR, 'dataloader/DataLoader.interface')
//   fs.writeFileSync(filePath, newContent, 'utf8')
// }

// function loadDataLoaderInterface (): string {
//   const filePath = path.join(INTERFACE_DIR, 'dataloader/DataLoader.interface')
//   const content = fs.readFileSync(filePath, 'utf8')
//   return content
// }

// function addLoaderFactoryInterface (oldContent, { modelName, target, type }: associationOptions): string {
//   const regex = /(?<=interface IDataLoaderFactory \{)(.|\s)*?(?=\})/
//   const [oldAssociationContent] = oldContent.match(regex)
//   const modelNameLowerCase = modelName.toLocaleLowerCase()
//   const loaderName = `${modelNameLowerCase}${target}Loader`
//   const isList = type.toLocaleLowerCase().includes('many')
//   const instance = isList ? `${target}Instance[][]` : `${target}Instance`
//   const newDataLoader = `${loaderName}: () => DataLoaderSafeNull<IDataLoaderParam, ${instance}>`
//   const newAssociationContent = `${oldAssociationContent}  ${newDataLoader}\n`
//   return oldContent.replace(regex, newAssociationContent)
// }
// #endregion
