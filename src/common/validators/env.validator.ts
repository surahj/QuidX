import * as Joi from 'joi';

export default Joi.object({
  PORT: Joi.number().default(8000),
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'staging')
    .default('development'),

  DATABASE_URL: Joi.string().required(),

  COMPANY_NAME: Joi.string().required(),
  COMPANY_EMAIL: Joi.string().required(),

  NGIMDOCK_LINKEDIN: Joi.string().required(),

  MAILTRAP_HOST: Joi.string().required(),
  MAILTRAP_USERNAME: Joi.string().required(),
  MAILTRAP_PASSWORD: Joi.string().required(),
  MAILTRAP_PORT: Joi.string().required(),

  OPEN_AI_KEY: Joi.string().required(),
  JWT_PUBLIC_KEY: Joi.string().required(),
  JWT_PRIVATE_KEY: Joi.string().required(),

  ADMINJS_ROUTE: Joi.string().when('NODE_ENV', {
    is: Joi.string().valid('development'),
    then: Joi.string().default('/admin'),
    otherwise: Joi.required(),
  }),
  ADMINJS_COOKIE_NAME: Joi.string().when('NODE_ENV', {
    is: Joi.string().valid('development'),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  ADMINJS_COOKIE_SECRET: Joi.string().when('NODE_ENV', {
    is: Joi.string().valid('development'),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),

  SWAGGER_ROUTE: Joi.string().default('/api/docs'),

  DEFAULT_ADMIN_USERNAME: Joi.string().when('NODE_ENV', {
    is: Joi.string().valid('development'),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
  DEFAULT_ADMIN_PASSWORD: Joi.string().when('NODE_ENV', {
    is: Joi.string().valid('development'),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),
});
