// Load environment variables FIRST before anything else
import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, validateSync } from 'class-validator';
import 'dotenv/config';

enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(NodeEnv)
  @IsOptional()
  NODE_ENV?: NodeEnv = NodeEnv.Development;

  @IsString()
  @IsOptional()
  CORS_ORIGINS?: string;

  @IsString()
  @IsOptional()
  HOST?: string = '0.0.0.0';

  @IsString()
  @IsOptional()
  PORT?: string = '5002';

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsString()
  @IsOptional()
  JWT_ISSUER?: string;

  @IsString()
  @IsNotEmpty()
  POSTGRES_DATABASE_URL!: string;

  @IsString()
  @IsOptional()
  REDIS_DATABASE_HOST?: string;

  @IsString()
  @IsOptional()
  REDIS_DATABASE_PORT?: string;

  // Email configuration - Server 1
  @IsString()
  @IsOptional()
  EMAIL_SERVER_1?: string;

  @IsString()
  @IsOptional()
  EMAIL_PORT_1?: string;

  @IsString()
  @IsOptional()
  EMAIL_USERNAME_1?: string;

  @IsString()
  @IsOptional()
  EMAIL_PASSWORD_1?: string;

  @IsString()
  @IsOptional()
  EMAIL_SENDER_1?: string;

  // Email configuration - Server 2
  @IsString()
  @IsOptional()
  EMAIL_SERVER_2?: string;

  @IsString()
  @IsOptional()
  EMAIL_PORT_2?: string;

  @IsString()
  @IsOptional()
  EMAIL_USERNAME_2?: string;

  @IsString()
  @IsOptional()
  EMAIL_PASSWORD_2?: string;

  @IsString()
  @IsOptional()
  EMAIL_SENDER_2?: string;

  // Email configuration - Server 3
  @IsString()
  @IsOptional()
  EMAIL_SERVER_3?: string;

  @IsString()
  @IsOptional()
  EMAIL_PORT_3?: string;

  @IsString()
  @IsOptional()
  EMAIL_USERNAME_3?: string;

  @IsString()
  @IsOptional()
  EMAIL_PASSWORD_3?: string;

  @IsString()
  @IsOptional()
  EMAIL_SENDER_3?: string;

  // SSLCommerz payment gateway
  @IsString()
  @IsOptional()
  SSLCOMMERZ_STORE_ID?: string;

  @IsString()
  @IsOptional()
  SSLCOMMERZ_STORE_PASSWORD?: string;

  @IsString()
  @IsOptional()
  SSLCOMMERZ_SANDBOX?: string = 'true';

  @IsString()
  @IsOptional()
  PAYMENT_SUCCESS_URL?: string;

  @IsString()
  @IsOptional()
  PAYMENT_FAIL_URL?: string;

  @IsString()
  @IsOptional()
  PAYMENT_CANCEL_URL?: string;

  @IsString()
  @IsOptional()
  API_BASE_URL?: string;

  // SMS provider (console stub by default)
  @IsString()
  @IsOptional()
  SMS_PROVIDER?: string = 'console';

  @IsString()
  @IsOptional()
  SMS_PROVIDER_API_KEY?: string;

  @IsString()
  @IsOptional()
  SMS_PROVIDER_SENDER_ID?: string;

  @IsString()
  @IsOptional()
  STARTER_UNLOCK_CREDITS?: string = '0';
}

function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    const errorMessages = errors
      .map(error => {
        const constraints = Object.values(error.constraints || {}).join(', ');
        return `${error.property}: ${constraints}`;
      })
      .join('\n');
    console.error('❌ Environment validation failed:\n', errorMessages);
    process.exit(1);
  }

  return validatedConfig;
}

// Validate and export
const env = validate(process.env);

// Export individual environment variables for easy access
export const nodeEnv = env.NODE_ENV;
export const host = env.HOST;
export const port = env.PORT;
export const jwtSecret = env.JWT_SECRET;
export const jwtIssuer = env.JWT_ISSUER;
export const databaseUrl = env.POSTGRES_DATABASE_URL;

export const redisDatabaseHost = env.REDIS_DATABASE_HOST;
export const redisDatabasePort = env.REDIS_DATABASE_PORT;

// Email configuration exports
export const emailServer1 = env.EMAIL_SERVER_1;
export const emailPort1 = env.EMAIL_PORT_1;
export const emailUsername1 = env.EMAIL_USERNAME_1;
export const emailPassword1 = env.EMAIL_PASSWORD_1;
export const emailSender1 = env.EMAIL_SENDER_1;

export const emailServer2 = env.EMAIL_SERVER_2;
export const emailPort2 = env.EMAIL_PORT_2;
export const emailUsername2 = env.EMAIL_USERNAME_2;
export const emailPassword2 = env.EMAIL_PASSWORD_2;
export const emailSender2 = env.EMAIL_SENDER_2;

export const emailServer3 = env.EMAIL_SERVER_3;
export const emailPort3 = env.EMAIL_PORT_3;
export const emailUsername3 = env.EMAIL_USERNAME_3;
export const emailPassword3 = env.EMAIL_PASSWORD_3;
export const emailSender3 = env.EMAIL_SENDER_3;

// Payment gateway exports
export const sslcommerzStoreId = env.SSLCOMMERZ_STORE_ID;
export const sslcommerzStorePassword = env.SSLCOMMERZ_STORE_PASSWORD;
export const sslcommerzSandbox = env.SSLCOMMERZ_SANDBOX !== 'false';
export const paymentSuccessUrl = env.PAYMENT_SUCCESS_URL;
export const paymentFailUrl = env.PAYMENT_FAIL_URL;
export const paymentCancelUrl = env.PAYMENT_CANCEL_URL;
export const apiBaseUrl = env.API_BASE_URL;

// SMS provider exports
export const smsProvider = env.SMS_PROVIDER;
export const smsProviderApiKey = env.SMS_PROVIDER_API_KEY;
export const smsProviderSenderId = env.SMS_PROVIDER_SENDER_ID;

export const starterUnlockCredits = Math.max(
  0,
  Number.parseInt(env.STARTER_UNLOCK_CREDITS ?? '0', 10) || 0,
);

// Export the validate function for use in ConfigModule
export { validate };
