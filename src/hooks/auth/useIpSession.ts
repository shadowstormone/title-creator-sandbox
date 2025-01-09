import { supabase } from "@/lib/supabaseClient";

export const getClientIp = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error getting IP:', error);
    return '';
  }
};

export const trackIpSession = async (userId: string) => {
  const ip = await getClientIp();
  if (!ip) return;

  const { error } = await supabase
    .from('ip_sessions')
    .upsert({
      user_id: userId,
      ip_address: ip,
      last_active: new Date().toISOString(),
    }, {
      onConflict: 'user_id, ip_address'
    });

  if (error) {
    console.error('Error tracking IP session:', error);
  }
};

export const checkIpSession = async (userId: string): Promise<boolean> => {
  const ip = await getClientIp();
  if (!ip) return false;

  const oneHourAgo = new Date();
  oneHourAgo.setHours(oneHourAgo.getHours() - 1);

  const { data, error } = await supabase
    .from('ip_sessions')
    .select('last_active')
    .eq('user_id', userId)
    .eq('ip_address', ip)
    .single();

  if (error || !data) return false;

  const lastActive = new Date(data.last_active);
  return lastActive > oneHourAgo;
};

export const updateIpActivity = async (userId: string) => {
  const ip = await getClientIp();
  if (!ip) return;

  const { error } = await supabase
    .from('ip_sessions')
    .update({ last_active: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('ip_address', ip);

  if (error) {
    console.error('Error updating IP activity:', error);
  }
};