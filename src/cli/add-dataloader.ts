import * as path from 'path'
import * as fs from 'fs'
import { associationOptions } from './add-relation'
import { INTERFACE_DIR, DATALOADER_DIR } from '.'

export function addDataloader (associateOptions: associationOptions): void {
  if (associateOptions.schema.type) {
    updateDataLoaderInterface(associateOptions)
    updateDataLoader(associateOptions)
  }
}
// #region DataLoader
function updateDataLoader (associateOptions: associationOptions): void {
  const content = loadDataLoaderFactory()
  const newContent = replaceDataLoader(content, associateOptions)
  const filePath = path.join(DATALOADER_DIR, 'DataLoaderFactory.ts')
  fs.writeFileSync(filePath, newContent, 'utf8')
}

function loadDataLoaderFactory (): string {
  const filePath = path.join(DATALOADER_DIR, 'DataLoaderFactory.ts')
  const content = fs.readFileSync(filePath, 'utf8')
  return content
}

function replaceDataLoader (oldContent: string, associateOptions: associationOptions): string {
  const { modelName, target } = associateOptions
  const modelNameLowerCase = modelName.toLocaleLowerCase()
  const regex = /(?<= {2}return \{)(.|\s)*?(?= {2}\})/
  const [oldDataloderContent] = oldContent.match(regex)
  const dataLoaderMethod = getDataLoaderMethod(associateOptions)
  const loaderName = `${modelNameLowerCase}${target}Loader`
  const newDataLoader = `${loaderName}: ${dataLoaderMethod}`
  const newAssociationContent = `\n    ${newDataLoader},${oldDataloderContent}`
  return oldContent.replace(regex, newAssociationContent)
}

function getDataLoaderMethod ({ type, target, modelName }: associationOptions): string {
  switch (type.toLocaleLowerCase()) {
    case 'belongsto':
      return `() => makeDataLoader(db.${target})`

    case 'hasone':
      return `() => makeDataLoaderHasOne(db.${modelName}.${target})`

    case 'hasmany':
      return `() => makeDataLoaderHasMany(db.${modelName}.${target})`
  }
}
// #endregion

// #region DataLoaderInterface
function updateDataLoaderInterface (associateOptions: associationOptions): void {
  const content = loadDataLoaderInterface()
  const newContent = replaceDataLoaderInterface(content, associateOptions)
  const filePath = path.join(INTERFACE_DIR, 'IDataLoader.ts')
  fs.writeFileSync(filePath, newContent, 'utf8')
}

function loadDataLoaderInterface (): string {
  const filePath = path.join(INTERFACE_DIR, 'IDataLoader.ts')
  const content = fs.readFileSync(filePath, 'utf8')
  return content
}

function replaceDataLoaderInterface (oldContent, { modelName, target, type }: associationOptions): string {
  const regex = /(?<=interface IDataLoaderFactory \{)(.|\s)*?(?=\})/
  const [oldAssociationContent] = oldContent.match(regex)
  const modelNameLowerCase = modelName.toLocaleLowerCase()
  const loaderName = `${modelNameLowerCase}${target}Loader`
  const isList = type.toLocaleLowerCase().includes('many')
  const instance = isList ? `${target}Instance[][]` : `${target}Instance`
  const newDataLoader = `${loaderName}: () => DataLoaderSafeNull<IDataLoaderParam, ${instance}>`
  const newAssociationContent = `${oldAssociationContent}  ${newDataLoader}\n`
  return oldContent.replace(regex, newAssociationContent)
}
// #endregion
