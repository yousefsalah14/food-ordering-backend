import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';
import { getPaginationData } from '../utils/getPaginationData';
import { applyExactFilters, applySearch } from '../utils/search.util';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly categoriesService: CategoriesService,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const category = await this.categoriesService.findEntity(
      createProductDto.categoryId,
    );
    const product = this.productsRepository.create({
      ...createProductDto,
      category,
    });

    return this.productsRepository.save(product);
  }

  async findAll(query: QueryProductsDto) {
    const {
      page,
      limit,
      search,
      categoryId,
      isAvailable,
      minPrice,
      maxPrice,
      nameEn,
      nameAr,
      descriptionEn,
      descriptionAr,
    } = query;
    const queryBuilder = this.productsRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    applySearch(queryBuilder, 'product', search, [
      'nameEn',
      'nameAr',
      'descriptionEn',
      'descriptionAr',
    ]);
    applyExactFilters(queryBuilder, 'product', { isAvailable });

    if (nameEn) {
      queryBuilder.andWhere('product.nameEn LIKE :nameEn', {
        nameEn: `%${nameEn}%`,
      });
    }

    if (nameAr) {
      queryBuilder.andWhere('product.nameAr LIKE :nameAr', {
        nameAr: `%${nameAr}%`,
      });
    }

    if (descriptionEn) {
      queryBuilder.andWhere('product.descriptionEn LIKE :descriptionEn', {
        descriptionEn: `%${descriptionEn}%`,
      });
    }

    if (descriptionAr) {
      queryBuilder.andWhere('product.descriptionAr LIKE :descriptionAr', {
        descriptionAr: `%${descriptionAr}%`,
      });
    }

    if (categoryId) {
      queryBuilder.andWhere('category.id = :categoryId', { categoryId });
    }

    if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    }

    if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    queryBuilder.orderBy('product.createdAt', 'DESC');
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [items, totalItems] = await queryBuilder.getManyAndCount();

    return {
      items,
      meta: getPaginationData(totalItems, page, limit),
    };
  }

  async findOne(id: string) {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);

    if (updateProductDto.categoryId) {
      product.category = await this.categoriesService.findEntity(
        updateProductDto.categoryId,
      );
    }

    Object.assign(product, {
      ...updateProductDto,
      categoryId: undefined,
    });

    return this.productsRepository.save(product);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.productsRepository.softDelete(id);
    return { message: 'Product deleted successfully' };
  }
}
