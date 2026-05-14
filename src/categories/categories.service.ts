import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { getPaginationData } from '../utils/getPaginationData';
import { applySearch } from '../utils/search.util';
import { CreateCategoryDto } from './dto/create-category.dto';
import { QueryCategoriesDto } from './dto/query-categories.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  create(createCategoryDto: CreateCategoryDto) {
    const category = this.categoriesRepository.create(createCategoryDto);
    return this.categoriesRepository.save(category);
  }

  async findAll(query: QueryCategoriesDto) {
    const {
      page,
      limit,
      search,
      nameEn,
      nameAr,
      descriptionEn,
      descriptionAr,
    } = query;
    const queryBuilder = this.categoriesRepository
      .createQueryBuilder('category')
      .loadRelationCountAndMap(
        'category.linkedProductsCount',
        'category.products',
      );

    applySearch(queryBuilder, 'category', search, [
      'nameEn',
      'nameAr',
      'descriptionEn',
      'descriptionAr',
    ]);

    if (nameEn) {
      queryBuilder.andWhere('category.nameEn LIKE :nameEn', {
        nameEn: `%${nameEn}%`,
      });
    }

    if (nameAr) {
      queryBuilder.andWhere('category.nameAr LIKE :nameAr', {
        nameAr: `%${nameAr}%`,
      });
    }

    if (descriptionEn) {
      queryBuilder.andWhere('category.descriptionEn LIKE :descriptionEn', {
        descriptionEn: `%${descriptionEn}%`,
      });
    }

    if (descriptionAr) {
      queryBuilder.andWhere('category.descriptionAr LIKE :descriptionAr', {
        descriptionAr: `%${descriptionAr}%`,
      });
    }

    queryBuilder.orderBy('category.createdAt', 'DESC');
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [items, totalItems] = await queryBuilder.getManyAndCount();

    return {
      items,
      meta: getPaginationData(totalItems, page, limit),
    };
  }

  async findOne(id: string) {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ['products'],
    });

    return this.ensureCategoryExists(category);
  }

  async findEntity(id: string) {
    const category = await this.categoriesRepository.findOne({
      where: { id },
    });

    return this.ensureCategoryExists(category);
  }

  private ensureCategoryExists(category: Category | null) {
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    Object.assign(category, updateCategoryDto);
    return this.categoriesRepository.save(category);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.categoriesRepository.softDelete(id);
    return { message: 'Category deleted successfully' };
  }
}
