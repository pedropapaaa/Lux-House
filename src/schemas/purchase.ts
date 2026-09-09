import { z } from 'zod';

const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;

export const purchaseSchema = z
  .object({
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    last_name: z.string().min(2, 'Sobrenome deve ter pelo menos 2 caracteres'),
    cpf: z.string().regex(cpfRegex, 'CPF inválido (ex: 000.000.000-00)'),
    phone: z.string().regex(phoneRegex, 'Telefone inválido (ex: (11) 99999-9999)'),
    email: z.string().email('E-mail inválido'),
    confirm_email: z.string().email('E-mail inválido'),
    lot_id: z.string().uuid('Selecione um lote'),
  })
  .refine((d) => d.email === d.confirm_email, {
    message: 'Os e-mails não coincidem',
    path: ['confirm_email'],
  });

export type PurchaseFormData = z.infer<typeof purchaseSchema>;
