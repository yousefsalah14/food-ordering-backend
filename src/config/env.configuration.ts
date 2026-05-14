const parseNumber = (value: string | undefined, fallback: number) => {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
};

export default () => ({
  app: {
    port: parseNumber(process.env.PORT, 3000),
    apiPrefix: process.env.API_PREFIX ?? 'api',
    swaggerPath: process.env.SWAGGER_PATH ?? 'docs',
    jwtSecret: process.env.JWT_SECRET ?? 'food-ordering-secret',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    baseUrl: process.env.APP_BASE_URL ?? 'http://localhost:3000',
    frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  },
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DB_HOST ?? 'localhost',
    port: parseNumber(process.env.DB_PORT, 3306),
    username: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    name: process.env.DB_NAME ?? 'food_ordering',
    synchronize: (process.env.DB_SYNCHRONIZE ?? 'true') === 'true',
  },
  payments: {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? '',
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY ?? '',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
    stripeSuccessUrl:
      process.env.STRIPE_SUCCESS_URL ?? 'http://localhost:3000/payment/success',
    stripeCancelUrl:
      process.env.STRIPE_CANCEL_URL ?? 'http://localhost:3000/payment/cancel',
    currency: process.env.STRIPE_CURRENCY ?? 'egp',
  },
});
