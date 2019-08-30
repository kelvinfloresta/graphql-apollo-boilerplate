import * as sequelize from 'sequelize'
import { IDataLoaderParam } from '../interface/IDataLoader'
const { Op } = sequelize

type generateBatch<T> = (params: IDataLoaderParam[]) => Promise<T>

export function makeBatch<TInstance extends sequelize.Instance<any>> (model: sequelize.Model<any, any>): generateBatch<TInstance[]> {
  return async (params: IDataLoaderParam[]) => {
    const ids = params.map(param => param.key)
    const attributes = params[0].attributes

    return model.findAll({
      where: { id: { [Op.in]: ids } },
      attributes
    })
  }
}

export function makeBatchHasOne<TInstance extends sequelize.Instance<any>> (
  association: sequelize.IncludeAssociation
): generateBatch<TInstance[]> {
  return async (params: IDataLoaderParam[]) => {
    const ids = params.map(param => param.key)
    const attributes = params[0].attributes

    const isBelongsTo = association['associationType'].startsWith('Belongs') as Boolean
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

export function makeBatchHasMany<TInstance extends sequelize.Instance<any>> (
  association: sequelize.IncludeAssociation
): generateBatch<TInstance[][][]> {
  return async (params: IDataLoaderParam[]): Promise<TInstance[][][]> => {
    const ids = params.map(param => param.key)
    const attributes = params[0].attributes
    const isBelongsTo = association['associationType'].startsWith('Belongs') as Boolean

    const parent = isBelongsTo ? association.target : association.source
    const child = isBelongsTo ? association.source : association.target

    const results = await parent.findAll({
      attributes: ['id'],
      where: { id: { [Op.in]: ids } },
      include: [{ model: child, attributes }]
    })

    const relationName = isBelongsTo ? child.name + 's' : association['associationAccessor'] as string
    results.sort((a, b) => ids.indexOf(a.get('id')) - ids.indexOf(b.get('id')))
    const mapped = results.map(entry => [entry.get(relationName) as TInstance[]])
    return mapped
  }
}
