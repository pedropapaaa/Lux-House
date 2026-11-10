import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import type { FieldArrayWithId, FieldErrors, UseFormRegister } from 'react-hook-form';
import { Input } from '../ui/Input';
import { maskCPF } from '../../lib/masks';
import type { PurchaseFormData } from '../../schemas/purchase';

interface GuestFieldsProps {
  fields: FieldArrayWithId<PurchaseFormData, 'guests'>[];
  register: UseFormRegister<PurchaseFormData>;
  errors: FieldErrors<PurchaseFormData>;
}

export default function GuestFields({ fields, register, errors }: GuestFieldsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-6 sm:mb-8"
    >
      <div className="mb-5 flex items-center gap-3 border-b border-neutral-200 pb-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white">
          <Users size={14} />
        </span>
        <div>
          <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Participantes do Camarote
          </span>
          <span className="mt-0.5 block text-xs text-neutral-500">
            Informe o nome e o CPF de cada convidado. Cada um recebe um ingresso no próprio nome.
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid gap-4 rounded-xl border border-neutral-200 bg-neutral-50/60 p-4 sm:grid-cols-2"
          >
            <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-neutral-500 sm:col-span-2">
              Convidado {index + 1}
            </div>
            <Input
              id={`guest-${index}-name`}
              label="Nome"
              tone="light"
              placeholder="Nome completo"
              error={errors.guests?.[index]?.name?.message}
              {...register(`guests.${index}.name`)}
            />
            <Input
              id={`guest-${index}-cpf`}
              label="CPF"
              tone="light"
              placeholder="000.000.000-00"
              maxLength={14}
              error={errors.guests?.[index]?.cpf?.message}
              {...register(`guests.${index}.cpf`, {
                onChange: (e) => {
                  e.target.value = maskCPF(e.target.value);
                },
              })}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
