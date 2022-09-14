import { inject, injectable } from 'tsyringe';
import AppError from '@shared/errors/AppError';
import { IRequestCreateOrder } from '../domain/models/IRequestCreateOrder';
import { IOrdersRepository } from '../domain/repositories/IOrdersRepository';
import { IOrder } from '../domain/models/IOrder';
import { ICustomersRepository } from '@modules/customers/domain/repositories/ICustomersRepository';
import { IProductsRepository } from '@modules/products/domain/repositories/IProductsRepository';

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
    @inject('ProductRepository')
    private productsRepository: IProductsRepository,
  ) {}
  public async execute({
    customer_id,
    products,
  }: IRequestCreateOrder): Promise<IOrder> {
    const customerExists = await this.customersRepository.findById(customer_id);

    if (!customerExists) {
      throw new AppError(
        `Could not find any customer with the givern id ${customer_id}.`,
      );
    }

    const existsProducts = await this.productsRepository.findAllByIds(products);

    if (!existsProducts.length) {
      throw new AppError(`Could not find any products with given ids.`);
    }

    const existsProductsIds = existsProducts.map(
      (product: { id: any }) => product.id,
    );

    const checkInexistentProducts = products.filter(
      product => !existsProductsIds.includes(product.id),
    );

    if (checkInexistentProducts.length) {
      throw new AppError(
        `Could not find product ${checkInexistentProducts[0].id}.`,
      );
    }

    const quantityAvailable = products.filter(
      product =>
        existsProducts.filter((p: { id: any }) => p.id === product.id)[0]
          .quantity < product.quantity,
    );

    if (quantityAvailable.length) {
      throw new AppError(
        `Quantity ${quantityAvailable[0].quantity} is not available for ${quantityAvailable[0].id}.`,
      );
    }

    const serializedProducts = products.map(product => ({
      product_id: product.id,
      quantity: product.quantity,
      price: existsProducts.filter((p: { id: any }) => p.id === product.id)[0]
        .price,
    }));

    const order = await this.ordersRepository.create({
      customer: customerExists,
      products: serializedProducts,
    });

    const updatedProductsQuantity = order?.order_products.map(
      (product: { product_id: string; id: string; quantity: number }) => ({
        id: product.product_id,
        quantity:
          existsProducts.filter(
            (p: { id: string }) => p.id === product.product_id,
          )[0].quantity - product.quantity,
      }),
    );

    updatedProductsQuantity &&
      (await this.productsRepository.updateStock(updatedProductsQuantity));

    return order;
  }
}

export default CreateOrderService;
