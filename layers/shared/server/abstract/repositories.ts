/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CachePort } from './cache';
import type { MetaResponse } from '~/layers/shared/app/types/meta';

type CustomOrderBy = {
  [key: string]: 'asc' | 'desc';
};

type SearchMapper<Entity, Where> = {
  [K in keyof Entity]?: (term?: string) => Where;
};

export type PaginateOptions<Where, OrderBy, Entity, Include> = {
  page: string | number;
  limit: string | number;
  search?: {
    term?: string;
    fields: (keyof Entity)[];
    mapper: SearchMapper<Entity, Where>;
  };
  where?: Where;
  order_by?: OrderBy | CustomOrderBy;
  include?: Include;
};

export class Repository<
  ModelDelegate extends {
    aggregate: any;
    groupBy: any;
    count: any;

    create: any;
    createMany: any;
    createManyAndReturn: any;

    delete: any;
    deleteMany: any;

    findFirst: any;
    findFirstOrThrow: any;
    findMany: any;
    findUnique: any;
    findUniqueOrThrow: any;

    update: any;
    updateMany: any;
    upsert: any;
    fields: any;
  },
  Where,
  OrderBy,
> {
  protected model: ModelDelegate;
  public cache: CachePort;

  constructor(model: ModelDelegate, cache: CachePort) {
    this.model = model;
    this.cache = cache;
  }

  _getModel() {
    return this.model;
  }

  async create(data: any) {
    return this.model.create({ data });
  }

  async createMany(data: any[]) {
    return this.model.createMany({
      data: {
        ...data,
      },
    });
  }

  async update<E = any>(id: number, data: any): Promise<E> {
    return this.model.update({ where: { id }, data });
  }

  async delete(id: number) {
    const deleted = await this.model.deleteMany({ where: { id } });
    return deleted.count > 0;
  }

  async paginate<T, Include>(options: PaginateOptions<Where, OrderBy, T, Include>): Promise<{ items: T[]; meta: MetaResponse }> {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;
    const search = options.search;
    const orderBy = {};
    let where = options.where ?? {};

    // --- Advanced Search Across Fields ---
    if (search?.term && search.fields?.length) {
      const OR = search.fields.map((field) => search.mapper?.[field]?.(search.term)).filter(Boolean);

      if (OR.length) {
        where = {
          AND: [where, { OR }],
        };
      }
    }

    const total_count = await this.model.count({
      where,
    });

    for (const [key, value] of Object.entries(options.order_by || {})) {
      if (!key || key === 'undefined' || key === 'null') continue;
      if (value !== 'asc' && value !== 'desc') continue;
      Object.assign(orderBy, { [key]: value });
    }

    const data = await this.model.findMany({
      orderBy,
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: options.include,
    });

    const total_pages = Math.ceil(total_count / limit);

    return {
      items: data,
      meta: {
        page,
        limit,
        total_count,
        total_pages,
      },
    };
  }
}
