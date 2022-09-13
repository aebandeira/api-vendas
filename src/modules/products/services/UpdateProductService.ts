import redisCache from '@shared/cache/RedisCache';
import AppError from '@shared/errors/AppError';
import { getCustomRepository } from 'typeorm';
import Product from '../typeorm/entities/Product';
import { ProductRepository } from '../typeorm/repositories/ProductsRepository';

interface IRequest {
  name: string;
  price: number;
  quantity: number;
  id: string;
}

class UpdateProductService {
  public async execute({
    name,
    price,
    quantity,
    id,
  }: IRequest): Promise<Product> {
    const productsRepository = getCustomRepository(ProductRepository);

    const product = await productsRepository.findOne(id);
    if (!product) {
      throw new AppError(`Product with id ${id} not found.`);
    }

    const productExists = await productsRepository.findByName(name);
    if (productExists && name !== product.name) {
      throw new AppError(`There is already one product with this name ${name}`);
    }

    product.name = name;
    product.price = price;
    product.quantity = quantity;

    await redisCache.invalidate('api-vendas-PRODUCT_LIST');
    await productsRepository.save(product);
    return product;
  }
}

export default UpdateProductService;
