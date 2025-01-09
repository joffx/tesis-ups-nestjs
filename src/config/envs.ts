import { Logger } from '@nestjs/common';
import 'dotenv/config';
import * as joi from 'joi';

const logger = new Logger('kioskoplus-api-logger-envs');

interface EnvVars {
  // CONFIG - 6
  STAGE: string;
  PORT: number;
  HOST_API: string;
  API_PREFIX: string;

  // BASE DE DATOS - 5
  DB_PASS: string;
  DB_NAME: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_USER: string;

  // AWS S3 - 6
  AWS_REGION: string;
  AWS_ENDPOINT: string;
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_BUCKET_NAME: string;
  AWS_FOLDER: string;
}

const envsSchema = joi
  .object({
    // CONFIG - 6
    STAGE: joi.string().required(),
    PORT: joi.number().required(),
    HOST_API: joi.string().required(),
    API_PREFIX: joi.string().required(),

    // BASE DE DATOS - 5
    DB_PASS: joi.string().required(),
    DB_NAME: joi.string().required(),
    DB_HOST: joi.string().required(),
    DB_PORT: joi.number().required(),
    DB_USER: joi.string().required(),

    // AWS S3 - 6
    AWS_REGION: joi.string().required(),
    AWS_ENDPOINT: joi.string().required(),
    AWS_ACCESS_KEY_ID: joi.string().required(),
    AWS_SECRET_ACCESS_KEY: joi.string().required(),
    AWS_BUCKET_NAME: joi.string().required(),
    AWS_FOLDER: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate(process.env);

if (error) {
  logger.error(`Error de validación de configuración: ${error.message}`);
  throw new Error(
    `Error de validación de configuración: ${error.message}. Asegúrese de tener un archivo .env en el directorio raíz.`,
  );
}
logger.log('Validación de configuración exitosa.');

const envVars: EnvVars = value;

export const envs = {
  // CONFIG - 6
  stage: envVars.STAGE,
  port: envVars.PORT,
  hostApi: envVars.HOST_API,
  apiPrefix: envVars.API_PREFIX,

  // BASE DE DATOS - 5
  dbName: envVars.DB_NAME,
  dbPass: envVars.DB_PASS,
  dbHost: envVars.DB_HOST,
  dbPort: envVars.DB_PORT,
  dbUser: envVars.DB_USER,

  // AWS S3 - 6
  awsRegion: envVars.AWS_REGION,
  awsEndpoint: envVars.AWS_ENDPOINT,
  awsAccessKeyId: envVars.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: envVars.AWS_SECRET_ACCESS_KEY,
  awsBucketName: envVars.AWS_BUCKET_NAME,
  awsFolder: envVars.AWS_FOLDER,
};
