import {Entity, model, property} from '@loopback/repository';

@model({settings: {strict: false}})
export class LoginAccount extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  username: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  // Define well-known properties here

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<LoginAccount>) {
    super(data);
  }
}

export interface LoginAccountRelations {
  // describe navigational properties here
}

export type LoginAccountWithRelations = LoginAccount & LoginAccountRelations;
