import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const LoginDTOSchema = z.object({
  email: z.string().email() .openapi ({ example:'user@example.com' }),
  senha: z.string().min(6) .openapi({ example:'userpasss' }),
});

export type LoginDTO = z.infer<typeof LoginDTOSchema>;
