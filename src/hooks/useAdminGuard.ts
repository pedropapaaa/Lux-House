import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function useAdminGuard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        if (mounted) { navigate('/admin'); setLoading(false); }
        return;
      }
      const { data } = await supabase
        .from('admin_profiles')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle();
      if (mounted) {
        if (!data) navigate('/admin');
        else setIsAdmin(true);
        setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [navigate]);

  return { loading, isAdmin };
}
