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
import {inject} from '@loopback/core';
import {LoginAccount} from '../models';
import {LoginAccountRepository} from '../repositories';
import {PasswordHasherBindings} from '../keys';
import {PasswordHasher} from '../services/hash.password.bcryptjs';

export class LoginAccountController {
  constructor(
    @repository(LoginAccountRepository)
    public loginAccountRepository: LoginAccountRepository,
    @inject(PasswordHasherBindings.PASSWORD_HASHER)
    public passwordHasher: PasswordHasher,
  ) {}

  @post('/account', {
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

  @get('/account/count', {
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

  @get('/account', {
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

  @patch('/account', {
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

  @get('/account/{id}', {
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

  @patch('/account/{id}', {
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

  @put('/account/{id}', {
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

  @del('/account/{id}', {
    responses: {
      '204': {
        description: 'LoginAccount DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.loginAccountRepository.deleteById(id);
  }
}
