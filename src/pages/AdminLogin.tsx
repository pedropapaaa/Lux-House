import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { AlertCircle, Lock, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

const loginSchema = z.object({
  email: z.string().email('E-mail invalido'),
  password: z.string().min(6, 'Senha invalida'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from('admin_profiles')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle();
      if (data) navigate('/admin/dashboard', { replace: true });
    })();
  }, [navigate]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError('');
    const { data: auth, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setServerError('E-mail ou senha incorretos.');
      return;
    }

    const { data: profile } = await supabase
      .from('admin_profiles')
      .select('id')
      .eq('id', auth.user.id)
      .maybeSingle();

    if (!profile) {
      await supabase.auth.signOut();
      setServerError('Voce nao tem permissao de acesso ao painel.');
      return;
    }

    navigate('/admin/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 sm:px-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[800px] h-[800px] rounded-full bg-purple-500/5 blur-[200px]" />
      </div>
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-pink-500/4 blur-[150px]" />

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #8B5CF6 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <picture>
              <source srcSet="/images/logo.webp" type="image/webp" />
              <img
                src="/images/logo.webp"
                alt="Lux House"
                width={72}
                height={72}
                className="w-18 h-18 object-contain mx-auto rounded-full mb-4"
                style={{ filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.5))' }}
              />
            </picture>
          </motion.div>
          <div className="font-script text-5xl text-gradient-primary mb-2">Lux House</div>
          <div className="flex items-center justify-center gap-2">
            <Sparkles size={10} className="text-purple-400" />
            <span className="text-[9px] tracking-[0.5em] text-white/25 uppercase">Painel Administrativo</span>
            <Sparkles size={10} className="text-pink-400" />
          </div>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit(onSubmit)}
          className="glass-card rounded-2xl p-6 sm:p-8 space-y-5"
        >
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-3">
              <Lock size={20} className="text-white" />
            </div>
            <h1 className="font-playfair text-xl text-white">Acesso Restrito</h1>
          </div>

          <Input
            label="E-mail"
            type="email"
            placeholder="admin@riolounge.com.br"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Senha"
            type="password"
            placeholder="********"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />

          {serverError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/25 rounded-xl"
            >
              <AlertCircle size={18} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-sm text-red-400">{serverError}</p>
            </motion.div>
          )}

          <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
            Acessar Painel
          </Button>
        </motion.form>
      </motion.div>
    </div>
  );
}
