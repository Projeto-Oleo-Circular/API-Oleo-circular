export interface EmailConfig {
  provider: 'gmail';
  from: string;
  gmailUser: string;
  gmailAppPassword: string;
}

export const emailConfig: EmailConfig = {
  provider: 'gmail',
  from: process.env.GMAIL_USER || '',
  gmailUser: process.env.GMAIL_USER || '',
  gmailAppPassword: process.env.GMAIL_APP_PASSWORD || '',
};