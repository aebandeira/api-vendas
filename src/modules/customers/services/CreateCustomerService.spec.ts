import AppError from '@shared/errors/AppError';
import FakeCustomersRepository from '../domain/repositories/fakes/FakeCustomersRepository';
import CreateCustomerService from './CreateCustomerService';

let fakeCustomersRepository: FakeCustomersRepository;
let createCustomer: CreateCustomerService;
describe('CreateCustomer', () => {
  beforeEach(() => {
    fakeCustomersRepository = new FakeCustomersRepository();
    createCustomer = new CreateCustomerService(fakeCustomersRepository);
  });

  it('should be able to create a new customer', async () => {
    const customer = await createCustomer.execute({
      name: 'Amanda Bandeira',
      email: 'a@gmail.com',
    });

    expect(customer).toHaveProperty('id');
  });

  it('should not be able to create a new customer with the same email', async () => {
    await createCustomer.execute({
      name: 'Amanda Bandeira',
      email: 'a@gmail.com',
    });

    expect(
      createCustomer.execute({
        name: 'Amanda Bandeira',
        email: 'a@gmail.com',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
