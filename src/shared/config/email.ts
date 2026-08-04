import dotenv from 'dotenv';

dotenv.config();

export interface EmailConfig {
  resendApiKey: string;
  from: string;
}

const getEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(` Variável de ambiente ${key} não definida`);
  }
  return value;
};

export const emailConfig: EmailConfig = {
  resendApiKey: getEnvVar('RESEND_API_KEY'),
  from: getEnvVar('EMAIL_FROM'),
};