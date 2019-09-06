import { Op, Model, HasOne, HasMany } from 'Sequelize'
import { IDataLoaderParam } from 'interface/dataloader/DataLoader.interface'

type generateBatch<T> = (params: IDataLoaderParam[]) => Promise<T>

export function makeBatch<T> (model): generateBatch<T[]> {
  return async (params: IDataLoaderParam[]) => {
    const ids = params.map(param => param.key)
    const attributes = params[0].attributes

    return model.findAll({
      where: { id: { [Op.in]: ids } },
      attributes
    })
  }
}

export function makeBatchHasOne<T extends Model, Y extends Model> (
  association: HasOne<T, Y>
): generateBatch<any[]> {
  return async (params: IDataLoaderParam[]) => {
    const ids = params.map(param => param.key)
    const attributes = params[0].attributes

    const isBelongsTo = association.associationType.startsWith('Belongs')
    const keyName = association.source.name + 'Id'

    if (isBelongsTo) {
      return association.source.findAll({
        where: { [keyName]: { [Op.in]: ids } },
        attributes
      })
    }

    const results = await association.target.findAll({
      where: { [keyName]: { [Op.in]: ids } },
      attributes
    })

    return results
  }
}

export function makeBatchHasMany<T extends Model = any, Y extends Model = any> (
  association: HasMany<T, Y>
): generateBatch<any[][][]> {
  return async (params: IDataLoaderParam[]): Promise<any[][][]> => {
    const ids = params.map(param => param.key)
    const attributes = params[0].attributes

    const isBelongsTo = association.associationType.startsWith('Belongs')

    const parent = isBelongsTo ? association.target : association.source
    const child = isBelongsTo ? association.source : association.target

    const results = await parent.findAll<any>({
      attributes: ['id'],
      where: { id: { [Op.in]: ids } },
      include: [{ model: child, attributes }]
    })

    const relationName = isBelongsTo ? child.name + 's' : association['associationAccessor'] as string
    results.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
    const mapped = results.map(entry => [entry.get(relationName) as any[]])
    return mapped
  }
}
