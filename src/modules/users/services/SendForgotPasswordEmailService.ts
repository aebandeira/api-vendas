import AppError from '@shared/errors/AppError';
import { getCustomRepository } from 'typeorm';
import UsersRepository from '../typeorm/respositories/UsersRepository';
import UserTokensRepository from '../typeorm/respositories/UserTokensRepository';

interface IRequest {
  email: string;
}

class SendForgotPasswordEmailService {
  public async execute({ email }: IRequest): Promise<void> {
    const usersRepository = getCustomRepository(UsersRepository);
    const userTokenRepository = getCustomRepository(UserTokensRepository);

    const user = await usersRepository.findByEmail(email);

    if (!user) {
      throw new AppError(`User does not exists.`);
    }

    const token = await userTokenRepository.generate(user.id);

    console.log(token);
  }
}

export default SendForgotPasswordEmailService;
