import { ApiHideProperty, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, OneToMany } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { BaseAppEntity } from '../../utils/baseEntity';

@Entity('categories')
export class Category extends BaseAppEntity {
  @ApiProperty({ example: 'Pizza' })
  @Column()
  nameEn!: string;

  @ApiProperty({ example: 'بيتزا' })
  @Column()
  nameAr!: string;

  @ApiProperty({ example: 'Freshly baked pizzas', required: false })
  @Column({ type: 'text', nullable: true })
  descriptionEn?: string | null;

  @ApiProperty({ example: 'بيتزا طازجة مخبوزة', required: false })
  @Column({ type: 'text', nullable: true })
  descriptionAr?: string | null;

  @ApiProperty({ example: '/uploads/categories/pizza.png', required: false })
  @Column({ type: 'varchar', nullable: true })
  imageUrl?: string | null;

  @OneToMany(() => Product, (product) => product.category)
  @ApiHideProperty()
  products!: Product[];

  @ApiPropertyOptional({ example: 12 })
  linkedProductsCount?: number;
}
