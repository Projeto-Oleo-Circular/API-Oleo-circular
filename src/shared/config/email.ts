export interface EmailConfig {
  provider: 'resend';
  from: string;
  resendApiKey: string;
}

export const emailConfig: EmailConfig = {
  provider: (process.env.EMAIL_PROVIDER as 'resend') || 'resend',
  from: process.env.EMAIL_FROM || 'no-reply@onmail.resend.dev',
  resendApiKey: process.env.RESEND_API_KEY || '',
};
