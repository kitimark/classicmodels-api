import {HttpErrors} from '@loopback/rest';
import {
  Credentials,
  LoginAccountRepository,
} from '../repositories/login-account.repository';
import {LoginAccount} from '../models/login-account.model';
import {UserService} from '@loopback/authentication';
import {UserProfile, securityId} from '@loopback/security';
import {repository} from '@loopback/repository';
import {PasswordHasher} from './hash.password.bcryptjs';
import {PasswordHasherBindings} from '../keys';
import {inject} from '@loopback/context';

export class MyUserService implements UserService<LoginAccount, Credentials> {
  constructor(
    @repository(LoginAccountRepository)
    public loginAccountRepository: LoginAccountRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
  ) {}

  async verifyCredentials(credentials: Credentials): Promise<LoginAccount> {
    const invalidCredentialsError = 'Invalid username or password.';

    const foundUser = await this.loginAccountRepository.findOne({
      where: {username: credentials.username},
    });

    if (!foundUser) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }
    const passwordMatched = await this.passwordHasher.comparePassword(
      credentials.password,
      foundUser.password,
    );

    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized(invalidCredentialsError);
    }

    return foundUser;
  }

  convertToUserProfile(account: LoginAccount): UserProfile {
    let userName = '';
    if (account.username) userName = `${account.firstName}`;
    return {[securityId]: account.id, name: userName};
  }
}
