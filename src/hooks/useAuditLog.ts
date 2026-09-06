import { supabase } from '../lib/supabase';

export async function logAudit(params: {
  action: string;
  event_id?: string | null;
  entity_type?: string;
  entity_id?: string;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
}) {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    await supabase.from('audit_logs').insert({
      action: params.action,
      event_id: params.event_id ?? null,
      user_id: session.user.id,
      user_email: session.user.email ?? null,
      entity_type: params.entity_type ?? null,
      entity_id: params.entity_id ?? null,
      old_values: params.old_values ?? null,
      new_values: params.new_values ?? null,
    });
  } catch {
    // Audit logging should never break the main operation
  }
}
