const CredentialsSchema = {
  type: 'object',
  required: ['username', 'password'],
  properties: {
    username: {
      type: 'string',
    },
    password: {
      type: 'string',
    },
  },
};

export const CredentialsRequestBody = {
  description: 'The input of login function',
  required: true,
  content: {
    'application/json': {schema: CredentialsSchema},
  },
};
