import { Op, Model, HasOne, HasMany, BelongsTo, ModelCtor, BelongsToMany } from 'Sequelize'
export interface BatchParam {
  key: string
  attributes: string[]
}

export type BatchFn<T> = (params: BatchParam[]) => Promise<T>

export function makeBatch<T extends Model> (model: ModelCtor<T>): BatchFn<T[]> {
  return async (params: BatchParam[]) => {
    const ids = params.map(param => param.key)
    const attributes = params[0].attributes

    return model.findAll<T>({
      where: { id: { [Op.in]: ids } },
      attributes
    })
  }
}

export function makeBatchBelongTo<T extends Model, Y extends Model> (
  association: BelongsTo<T, Y>
): BatchFn<T[]> {
  return async function (params: BatchParam[]) {
    const ids = params.map(el => el.key)
    const attributes = params[0].attributes
    const results = await association.source.findAll<T>({
      where: { id: { [Op.in]: ids } },
      attributes
    })
    return results
  }
}

export function makeBatchHasOne<T extends Model, Y extends Model> (
  association: HasOne<Y, T>
): BatchFn<T[]> {
  return async function (params: BatchParam[]) {
    const ids = params.map(el => el.key)
    const attributes = params[0].attributes
    const keyName = association.source.name + 'Id'
    const results = await association.target.findAll<T>({
      where: { [keyName]: { [Op.in]: ids } },
      attributes
    })

    return results
  }
}

export function makeBatchManyBelongsTo<T extends Model, Y extends Model> (
  association: BelongsTo<T, Y>
): BatchFn<Y[][][]> {
  return async (params: BatchParam[]): Promise<Y[][][]> => {
    const ids = params.map(param => param.key)
    const attributes = params[0].attributes

    const results = await association.target.findAll<Y>({
      attributes: ['id'],
      where: { id: { [Op.in]: ids } },
      include: [{ model: association.source, attributes }]
    })

    const relationName = association.source.name + 's'
    results.sort((a, b) => ids.indexOf(a['id']) - ids.indexOf(b['id']))
    const mapped = results.map(entry => [entry.get(relationName) as Y[]])
    return mapped
  }
}

export function makeBatchHasMany<T extends Model, Y extends Model> (
  association: HasMany<T, Y>
): BatchFn<T[][][]> {
  return async (params: BatchParam[]): Promise<T[][][]> => {
    const ids = params.map(param => param.key)
    const attributes = params[0].attributes

    const results = await association.source.findAll<T>({
      attributes: ['id'],
      where: { id: { [Op.in]: ids } },
      include: [{ model: association.target, attributes }]
    })

    const relationName = association['associationAccessor']
    results.sort((a, b) => ids.indexOf(a['id']) - ids.indexOf(b['id']))
    const mapped = results.map(entry => [entry.get(relationName) as T[]])
    return mapped
  }
}

export function makeBatchBelongsToMany<T extends Model, Y extends Model> (
  association: BelongsToMany<T, Y>
): BatchFn<Y[][] > {
  return async (params: BatchParam[]): Promise<Y[][]> => {
    const ids = params.map(param => param.key)
    const attributes = params[0].attributes
    const results = await association.source.findAll<T>({
      attributes: ['id'],
      where: { id: { [Op.in]: ids } },
      include: [{ model: association.target, attributes }]
    })

    const relationName = association['associationAccessor']
    const mapped = ids.map(id => {
      const resultFound = results.find(result => result.get('id') === id)
      if (resultFound === null || resultFound === undefined) {
        return []
      }
      return resultFound.get(relationName) as Y[]
    })
    return mapped
  }
}
