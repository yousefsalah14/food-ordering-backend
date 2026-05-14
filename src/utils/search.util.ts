import { ObjectLiteral, SelectQueryBuilder } from 'typeorm';

export function applySearch<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  alias: string,
  search: string | undefined,
  fields: string[],
): SelectQueryBuilder<T> {
  if (!search?.trim() || !fields.length) {
    return queryBuilder;
  }

  const normalized = `%${search.trim()}%`;
  const clauses = fields.map((field, index) => `${alias}.${field} LIKE :search${index}`);

  const params = fields.reduce<Record<string, string>>((accumulator, _field, index) => {
    accumulator[`search${index}`] = normalized;
    return accumulator;
  }, {});

  return queryBuilder.andWhere(`(${clauses.join(' OR ')})`, params);
}

export function applyExactFilters<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  alias: string,
  filters: Record<string, string | number | boolean | undefined>,
): SelectQueryBuilder<T> {
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    queryBuilder.andWhere(`${alias}.${key} = :${key}`, { [key]: value });
  });

  return queryBuilder;
}
