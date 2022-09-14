import { container } from 'tsyringe';
import BcryptHashProvider from './HashProviders/implementations/BcryptHashProvider';
import { IHashProvider } from './HashProviders/models/IHashProvider';

container.registerSingleton<IHashProvider>('HashProvider', BcryptHashProvider);
