import { Op, Model, HasOne, HasMany, BelongsTo, ModelCtor, BelongsToMany } from 'Sequelize'
export interface BatchParam {
  key: string
  attributes: string[]
}

export type BatchFn<T> = (params: BatchParam[]) => Promise<T>

/**
 * Create a function to batch which return a collection of model.
 *
 * @param model
 */
export function makeBatch<T extends Model> (model: ModelCtor<T>): BatchFn<T[]> {
  return async (params: BatchParam[]) => {
    const ids = params.map(param => param.key)
    const attributes = params[0].attributes

    const results = await model.findAll<T>({
      where: { id: { [Op.in]: ids } },
      attributes
    })

    const ordered = results.sort((a, b) => ids.indexOf(a['id']) - ids.indexOf(b['id']))
    return ordered
  }
}

/**
 * It's like `makeBatch`, but this method is prefered because is most expressive.
 * @see makeBatch
 *
 * @param {BelongsTo<T,Y>} association
 */
export function makeBatchBelongsTo<T extends Model, Y extends Model> (
  association: BelongsTo<T, Y>
): BatchFn<Y[]> {
  return makeBatch(association.target)
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

    const ordered = results.sort((a, b) => ids.indexOf(a['id']) - ids.indexOf(b['id']))
    return ordered
  }
}

export function makeBatchManyBelongsTo<T extends Model, Y extends Model> (
  association: BelongsTo<T, Y>
): BatchFn<Y[][]> {
  return async (params: BatchParam[]): Promise<Y[][]> => {
    const ids = params.map(param => param.key)
    const attributes = params[0].attributes

    const results = await association.target.findAll<Y>({
      attributes: ['id'],
      where: { id: { [Op.in]: ids } },
      include: [{ model: association.source, attributes }]
    })

    const relationName = association.source.name + 's'
    const ordered = mapOrderResult<Y>(ids, results, relationName)
    return ordered
  }
}

export function makeBatchHasMany<T extends Model, Y extends Model> (
  association: HasMany<T, Y>
): BatchFn<T[][]> {
  return async (params: BatchParam[]): Promise<T[][]> => {
    const ids = params.map(param => param.key)
    const attributes = params[0].attributes

    const results = await association.source.findAll<T>({
      attributes: ['id'],
      where: { id: { [Op.in]: ids } },
      include: [{ model: association.target, attributes }]
    })

    const relationName = association['associationAccessor']
    const ordered = mapOrderResult<T>(ids, results, relationName)
    return ordered
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
    const ordered = mapOrderResult<T, Y>(ids, results, relationName)
    return ordered
  }
}

function mapOrderResult<T extends Model, Y = T> (ids: string[], results: T[], relationName: string): Y[][] {
  const mapped = ids.map(id => {
    const resultFound = results.find(result => result.get('id') === id)
    if (resultFound === null || resultFound === undefined) {
      return []
    }
    return resultFound.get(relationName) as Y[]
  })
  return mapped
}
