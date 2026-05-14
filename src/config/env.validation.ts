type Env = Record<string, string | undefined>;

const requireNumber = (env: Env, key: string) => {
  const value = env[key];

  if (value === undefined || value === '') {
    return;
  }

  if (!Number.isFinite(Number(value))) {
    throw new Error(`${key} must be a valid number`);
  }
};

const requireBoolean = (env: Env, key: string) => {
  const value = env[key];

  if (value === undefined || value === '') {
    return;
  }

  if (!['true', 'false'].includes(value)) {
    throw new Error(`${key} must be either true or false`);
  }
};

export function validateEnv(config: Env) {
  requireNumber(config, 'PORT');
  requireNumber(config, 'DB_PORT');
  requireBoolean(config, 'DB_SYNCHRONIZE');

  return config;
}
