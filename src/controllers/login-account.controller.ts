import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getModelSchemaRef,
  getWhereSchemaFor,
  patch,
  put,
  del,
  requestBody,
} from '@loopback/rest';
import {UserService, TokenService} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {LoginAccount} from '../models';
import {LoginAccountRepository} from '../repositories';
import {
  PasswordHasherBindings,
  TokenServiceBindings,
  UserServiceBindings,
} from '../keys';
import {PasswordHasher} from '../services/hash.password.bcryptjs';
import {CredentialsRequestBody} from './specs/login-account.controller.spec';
import {Credentials} from '../repositories/login-account.repository';

export class LoginAccountController {
  constructor(
    @repository(LoginAccountRepository)
    public loginAccountRepository: LoginAccountRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: UserService<LoginAccount, Credentials>,
  ) {}

  @post('/accounts', {
    responses: {
      '200': {
        description: 'LoginAccount model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(LoginAccount)},
        },
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(LoginAccount, {
            title: 'NewLoginAccount',
            exclude: ['id'],
          }),
        },
      },
    })
    loginAccount: Omit<LoginAccount, 'id'>,
  ): Promise<LoginAccount> {
    // encrypt password
    // eslint-disable-next-line require-atomic-updates
    loginAccount.password = await this.passwordHasher.hashPassword(
      loginAccount.password,
    );

    // create new login account
    const newLoginAccount = await this.loginAccountRepository.create(
      loginAccount,
    );
    delete newLoginAccount.password;
    return newLoginAccount;
  }

  @get('/accounts/count', {
    responses: {
      '200': {
        description: 'LoginAccount model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(LoginAccount))
    where?: Where<LoginAccount>,
  ): Promise<Count> {
    return this.loginAccountRepository.count(where);
  }

  @get('/accounts', {
    responses: {
      '200': {
        description: 'Array of LoginAccount model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(LoginAccount)},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(LoginAccount))
    filter?: Filter<LoginAccount>,
  ): Promise<LoginAccount[]> {
    return this.loginAccountRepository.find(filter);
  }

  @patch('/accounts', {
    responses: {
      '200': {
        description: 'LoginAccount PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(LoginAccount, {partial: true}),
        },
      },
    })
    loginAccount: LoginAccount,
    @param.query.object('where', getWhereSchemaFor(LoginAccount))
    where?: Where<LoginAccount>,
  ): Promise<Count> {
    return this.loginAccountRepository.updateAll(loginAccount, where);
  }

  @get('/accounts/{id}', {
    responses: {
      '200': {
        description: 'LoginAccount model instance',
        content: {
          'application/json': {schema: getModelSchemaRef(LoginAccount)},
        },
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<LoginAccount> {
    return this.loginAccountRepository.findById(id);
  }

  @patch('/accounts/{id}', {
    responses: {
      '204': {
        description: 'LoginAccount PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(LoginAccount, {partial: true}),
        },
      },
    })
    loginAccount: LoginAccount,
  ): Promise<void> {
    await this.loginAccountRepository.updateById(id, loginAccount);
  }

  @put('/accounts/{id}', {
    responses: {
      '204': {
        description: 'LoginAccount PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() loginAccount: LoginAccount,
  ): Promise<void> {
    await this.loginAccountRepository.replaceById(id, loginAccount);
  }

  @del('/accounts/{id}', {
    responses: {
      '204': {
        description: 'LoginAccount DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.loginAccountRepository.deleteById(id);
  }

  @post('/accounts/login', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody(CredentialsRequestBody) credentials: Credentials,
  ): Promise<{token: String}> {
    const account = await this.userService.verifyCredentials(credentials);

    const accountProfile = this.userService.convertToUserProfile(account);

    const token = await this.jwtService.generateToken(accountProfile);

    return {token};
  }
}
