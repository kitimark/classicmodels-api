import {DefaultCrudRepository} from '@loopback/repository';
import {LoginAccount, LoginAccountRelations} from '../models';
import {ClassicmodelsDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class LoginAccountRepository extends DefaultCrudRepository<
  LoginAccount,
  typeof LoginAccount.prototype.id,
  LoginAccountRelations
> {
  constructor(
    @inject('datasources.classicmodels') dataSource: ClassicmodelsDataSource,
  ) {
    super(LoginAccount, dataSource);
  }
}
